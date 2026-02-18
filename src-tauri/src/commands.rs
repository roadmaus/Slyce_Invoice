use std::fs;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};
use serde::Serialize;

#[derive(Serialize)]
pub struct TemplateInfo {
    pub name: String,
    pub path: String,
    pub modified: String,
}

fn get_template_directory(app: &AppHandle) -> PathBuf {
    let app_data = app.path().app_data_dir().expect("failed to get app data dir");
    app_data.join("templates")
}

fn get_bundled_templates_dir(app: &AppHandle) -> PathBuf {
    app.path().resource_dir().expect("failed to get resource dir").join("resources").join("templates")
}

fn ensure_templates_exist(app: &AppHandle) -> Result<PathBuf, String> {
    let template_dir = get_template_directory(app);
    let default_template_path = template_dir.join("invoice_template.html");

    // Create template directory if it doesn't exist
    if !template_dir.exists() {
        fs::create_dir_all(&template_dir).map_err(|e| e.to_string())?;
    }

    // Copy all bundled templates if not present
    let bundled_dir = get_bundled_templates_dir(app);
    if bundled_dir.exists() {
        if let Ok(entries) = fs::read_dir(&bundled_dir) {
            for entry in entries.flatten() {
                let file_name = entry.file_name();
                let user_path = template_dir.join(&file_name);
                if !user_path.exists() {
                    let _ = fs::copy(entry.path(), &user_path);
                }
            }
        }
    }

    // Ensure at least one template exists
    let templates: Vec<_> = fs::read_dir(&template_dir)
        .map_err(|e| e.to_string())?
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().map_or(false, |ext| ext == "html"))
        .collect();

    if templates.is_empty() {
        return Err("No templates found in templates directory".to_string());
    }

    // Set first template as default if default doesn't exist
    if !default_template_path.exists() {
        fs::copy(templates[0].path(), &default_template_path).map_err(|e| e.to_string())?;
    }

    Ok(default_template_path)
}

#[tauri::command]
pub async fn save_invoice(
    pdf_data: Vec<u8>,
    file_name: String,
    custom_save_path: Option<String>,
) -> Result<bool, String> {
    let year = chrono::Local::now().format("%Y").to_string();
    let safe_file_name = file_name
        .replace(['/', '\\', '?', '%', '*', ':', '|', '"', '<', '>'], "-");

    let file_path = if let Some(ref custom_path) = custom_save_path {
        if !custom_path.is_empty() {
            let year_dir = PathBuf::from(custom_path).join(&year);
            fs::create_dir_all(&year_dir).map_err(|e| e.to_string())?;
            year_dir.join(format!("{}.pdf", safe_file_name))
        } else {
            let home = dirs::home_dir().ok_or("Cannot find home directory")?;
            let year_dir = home.join("Documents").join("Invoices").join(&year);
            fs::create_dir_all(&year_dir).map_err(|e| e.to_string())?;
            year_dir.join(format!("{}.pdf", safe_file_name))
        }
    } else {
        let home = dirs::home_dir().ok_or("Cannot find home directory")?;
        let year_dir = home.join("Documents").join("Invoices").join(&year);
        fs::create_dir_all(&year_dir).map_err(|e| e.to_string())?;
        year_dir.join(format!("{}.pdf", safe_file_name))
    };

    fs::write(&file_path, &pdf_data).map_err(|e| e.to_string())?;
    log::info!("Invoice saved to: {:?}", file_path);
    Ok(true)
}

#[tauri::command]
pub async fn get_invoice_template(app: AppHandle) -> Result<String, String> {
    let template_path = ensure_templates_exist(&app)?;
    fs::read_to_string(&template_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_template_path(app: AppHandle) -> Result<String, String> {
    let template_path = ensure_templates_exist(&app)?;
    Ok(template_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn save_template(
    app: AppHandle,
    content: String,
    is_default: bool,
) -> Result<bool, String> {
    let template_dir = get_template_directory(&app);
    let default_template_path = ensure_templates_exist(&app)?;

    // Always update the default template
    fs::write(&default_template_path, &content).map_err(|e| e.to_string())?;

    // Create a timestamped copy if not default
    if !is_default {
        let timestamp = chrono::Local::now().format("%Y-%m-%dT%H-%M-%S").to_string();
        let template_name = format!("template_{}.html", timestamp);
        let template_path = template_dir.join(template_name);
        fs::write(&template_path, &content).map_err(|e| e.to_string())?;
    }

    Ok(true)
}

#[tauri::command]
pub async fn reset_template(app: AppHandle) -> Result<bool, String> {
    let template_dir = get_template_directory(&app);
    let user_template_path = template_dir.join("invoice_template.html");
    let bundled_dir = get_bundled_templates_dir(&app);

    let entries: Vec<_> = fs::read_dir(&bundled_dir)
        .map_err(|e| e.to_string())?
        .filter_map(|e| e.ok())
        .collect();

    if let Some(first) = entries.first() {
        fs::copy(first.path(), &user_template_path).map_err(|e| e.to_string())?;
        Ok(true)
    } else {
        Ok(false)
    }
}

#[tauri::command]
pub async fn get_recent_templates(app: AppHandle) -> Result<Vec<TemplateInfo>, String> {
    let template_dir = get_template_directory(&app);
    let default_template_path = ensure_templates_exist(&app)?;
    let default_normalized = default_template_path.canonicalize().unwrap_or(default_template_path);

    let mut templates = Vec::new();
    let entries = fs::read_dir(&template_dir).map_err(|e| e.to_string())?;

    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().map_or(true, |ext| ext != "html") {
            continue;
        }
        let canonical = path.canonicalize().unwrap_or(path.clone());
        if canonical == default_normalized {
            continue;
        }

        let name = path
            .file_stem()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string()
            .trim_start_matches("template_")
            .replace('-', " ");

        let modified = entry
            .metadata()
            .ok()
            .and_then(|m| m.modified().ok())
            .map(|t| {
                let datetime: chrono::DateTime<chrono::Local> = t.into();
                datetime.format("%m/%d/%Y").to_string()
            })
            .unwrap_or_default();

        templates.push(TemplateInfo {
            name,
            path: path.to_string_lossy().to_string(),
            modified,
        });
    }

    // Sort by modified date descending
    templates.sort_by(|a, b| b.modified.cmp(&a.modified));
    Ok(templates)
}

#[tauri::command]
pub async fn load_template_from_path(app: AppHandle, path: String) -> Result<String, String> {
    let template_dir = get_template_directory(&app);
    let template_path = Path::new(&path);

    // Validate path is within templates directory
    let canonical_path = template_path.canonicalize().map_err(|e| e.to_string())?;
    let canonical_dir = template_dir.canonicalize().map_err(|e| e.to_string())?;
    if !canonical_path.starts_with(&canonical_dir) {
        return Err("Invalid template path".to_string());
    }

    let content = fs::read_to_string(template_path).map_err(|e| e.to_string())?;

    // Also set as default template
    let default_path = ensure_templates_exist(&app)?;
    fs::write(&default_path, &content).map_err(|e| e.to_string())?;

    Ok(content)
}

#[tauri::command]
pub async fn delete_template(app: AppHandle, path: String) -> Result<bool, String> {
    let template_dir = get_template_directory(&app);
    let template_path = Path::new(&path);
    let default_path = ensure_templates_exist(&app)?;

    let canonical_path = template_path.canonicalize().map_err(|e| e.to_string())?;
    let canonical_dir = template_dir.canonicalize().map_err(|e| e.to_string())?;
    let canonical_default = default_path.canonicalize().unwrap_or(default_path);

    if !canonical_path.starts_with(&canonical_dir) {
        return Err("Invalid template path".to_string());
    }
    if canonical_path == canonical_default {
        return Err("Cannot delete default template".to_string());
    }

    fs::remove_file(template_path).map_err(|e| e.to_string())?;
    Ok(true)
}

#[tauri::command]
pub async fn rename_template(
    app: AppHandle,
    path: String,
    new_name: String,
) -> Result<String, String> {
    let template_dir = get_template_directory(&app);
    let template_path = Path::new(&path);
    let default_path = ensure_templates_exist(&app)?;

    let canonical_path = template_path.canonicalize().map_err(|e| e.to_string())?;
    let canonical_dir = template_dir.canonicalize().map_err(|e| e.to_string())?;
    let canonical_default = default_path.canonicalize().unwrap_or(default_path);

    if !canonical_path.starts_with(&canonical_dir) {
        return Err("Invalid template path".to_string());
    }
    if canonical_path == canonical_default {
        return Err("Cannot rename default template".to_string());
    }

    let new_path = template_dir.join(format!("template_{}.html", new_name));
    fs::rename(template_path, &new_path).map_err(|e| e.to_string())?;
    Ok(new_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn export_data(app: AppHandle, data: String) -> Result<bool, String> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app
        .dialog()
        .file()
        .set_file_name("slyce-invoice-backup.json")
        .add_filter("JSON", &["json"])
        .blocking_save_file();

    if let Some(path) = file_path {
        fs::write(path.as_path().unwrap(), &data).map_err(|e| e.to_string())?;
        Ok(true)
    } else {
        Ok(false)
    }
}

#[tauri::command]
pub async fn import_data(app: AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app
        .dialog()
        .file()
        .add_filter("JSON", &["json"])
        .blocking_pick_file();

    if let Some(path) = file_path {
        let content = fs::read_to_string(path.as_path().unwrap()).map_err(|e| e.to_string())?;
        // Validate JSON structure
        let parsed: serde_json::Value =
            serde_json::from_str(&content).map_err(|e| e.to_string())?;
        let required = ["customers", "businessProfiles", "quickTags"];
        for key in required {
            if !parsed.get(key).map_or(false, |v| v.is_array()) {
                return Err("Invalid data structure".to_string());
            }
        }
        Ok(Some(content))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub async fn seed_templates(app: AppHandle) -> Result<(), String> {
    ensure_templates_exist(&app)?;
    Ok(())
}
