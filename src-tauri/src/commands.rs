use std::fs;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};
use serde::Serialize;

const BUNDLED_PREFIX: &str = "bundled:";

#[derive(Serialize)]
pub struct TemplateInfo {
    pub name: String,
    pub path: String,
    pub modified: String,
    pub content: String,
    pub bundled: bool,
}

fn get_template_directory(app: &AppHandle) -> PathBuf {
    let app_data = app.path().app_data_dir().expect("failed to get app data dir");
    app_data.join("templates")
}

fn get_bundled_templates_dir(app: &AppHandle) -> PathBuf {
    app.path().resource_dir().expect("failed to get resource dir").join("resources").join("templates")
}

/// Read a sorted list of bundled template filenames (e.g. "001_modern.html").
fn list_bundled_template_filenames(app: &AppHandle) -> Vec<String> {
    let dir = get_bundled_templates_dir(app);
    let mut names: Vec<String> = fs::read_dir(&dir)
        .into_iter()
        .flatten()
        .flatten()
        .filter(|e| e.path().extension().map_or(false, |ext| ext == "html"))
        .filter_map(|e| e.file_name().to_str().map(|s| s.to_string()))
        .collect();
    names.sort();
    names
}

/// Resolve a bundled template filename to its absolute path on disk.
/// Filename must be a plain file name with no path separators.
fn resolve_bundled_template(app: &AppHandle, filename: &str) -> Result<PathBuf, String> {
    if filename.contains('/') || filename.contains('\\') || filename.contains("..") {
        return Err("Invalid bundled template name".to_string());
    }
    let path = get_bundled_templates_dir(app).join(filename);
    if !path.exists() {
        return Err(format!("Bundled template not found: {}", filename));
    }
    Ok(path)
}

fn read_first_bundled_template(app: &AppHandle) -> Result<String, String> {
    let names = list_bundled_template_filenames(app);
    let first = names.first().ok_or("No bundled templates available")?;
    let path = resolve_bundled_template(app, first)?;
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

/// Remove legacy auto-copied bundled templates from the user templates dir.
/// Older versions of the app copied every bundled template into app_data on
/// first run, which froze users on stale designs and made fresh bundled
/// updates invisible. This sweeps those copies away so the bundle becomes
/// the single source of truth.
fn migrate_legacy_bundled_copies(app: &AppHandle) {
    let user_dir = get_template_directory(app);
    for name in list_bundled_template_filenames(app) {
        let legacy_copy = user_dir.join(&name);
        if legacy_copy.exists() {
            let _ = fs::remove_file(&legacy_copy);
        }
    }
}

/// Ensures the user templates directory and the active template file exist.
/// The active template is a working copy the editor reads/writes; on first
/// run it is seeded from the first bundled template.
fn ensure_templates_exist(app: &AppHandle) -> Result<PathBuf, String> {
    let template_dir = get_template_directory(app);
    let active_path = template_dir.join("invoice_template.html");

    if !template_dir.exists() {
        fs::create_dir_all(&template_dir).map_err(|e| e.to_string())?;
    }

    migrate_legacy_bundled_copies(app);

    if !active_path.exists() {
        let content = read_first_bundled_template(app)?;
        fs::write(&active_path, content).map_err(|e| e.to_string())?;
    }

    Ok(active_path)
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
    let active_path = ensure_templates_exist(&app)?;
    let content = read_first_bundled_template(&app)?;
    fs::write(&active_path, content).map_err(|e| e.to_string())?;
    Ok(true)
}

#[tauri::command]
pub async fn get_recent_templates(app: AppHandle) -> Result<Vec<TemplateInfo>, String> {
    let _ = ensure_templates_exist(&app)?;

    let mut bundled_templates: Vec<TemplateInfo> = Vec::new();
    let mut user_templates: Vec<TemplateInfo> = Vec::new();

    // Bundled templates — read directly from resources, never copied.
    for filename in list_bundled_template_filenames(&app) {
        let path = match resolve_bundled_template(&app, &filename) {
            Ok(p) => p,
            Err(_) => continue,
        };
        let content = fs::read_to_string(&path).unwrap_or_default();
        let name = Path::new(&filename)
            .file_stem()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        bundled_templates.push(TemplateInfo {
            name,
            path: format!("{}{}", BUNDLED_PREFIX, filename),
            modified: "—".to_string(),
            content,
            bundled: true,
        });
    }

    // User templates from app data dir (excluding the active working copy).
    let template_dir = get_template_directory(&app);
    let active_path = template_dir.join("invoice_template.html");
    let active_canonical = active_path.canonicalize().unwrap_or(active_path);

    if let Ok(entries) = fs::read_dir(&template_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().map_or(true, |ext| ext != "html") {
                continue;
            }
            let canonical = path.canonicalize().unwrap_or(path.clone());
            if canonical == active_canonical {
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

            let content = fs::read_to_string(&path).unwrap_or_default();

            user_templates.push(TemplateInfo {
                name,
                path: path.to_string_lossy().to_string(),
                modified,
                content,
                bundled: false,
            });
        }
    }

    // User templates most-recent-first, then bundled appended in filename order.
    user_templates.sort_by(|a, b| b.modified.cmp(&a.modified));
    let mut out = bundled_templates;
    out.extend(user_templates);
    Ok(out)
}

#[tauri::command]
pub async fn load_template_from_path(app: AppHandle, path: String) -> Result<String, String> {
    let active_path = ensure_templates_exist(&app)?;

    // Bundled templates are addressed via the `bundled:<filename>` scheme so
    // the frontend never needs to know where the resource dir lives.
    let content = if let Some(filename) = path.strip_prefix(BUNDLED_PREFIX) {
        let resolved = resolve_bundled_template(&app, filename)?;
        fs::read_to_string(&resolved).map_err(|e| e.to_string())?
    } else {
        let template_dir = get_template_directory(&app);
        let template_path = Path::new(&path);
        let canonical_path = template_path.canonicalize().map_err(|e| e.to_string())?;
        let canonical_dir = template_dir.canonicalize().map_err(|e| e.to_string())?;
        if !canonical_path.starts_with(&canonical_dir) {
            return Err("Invalid template path".to_string());
        }
        fs::read_to_string(template_path).map_err(|e| e.to_string())?
    };

    fs::write(&active_path, &content).map_err(|e| e.to_string())?;
    Ok(content)
}

#[tauri::command]
pub async fn delete_template(app: AppHandle, path: String) -> Result<bool, String> {
    if path.starts_with(BUNDLED_PREFIX) {
        return Err("Cannot delete a bundled template".to_string());
    }

    let template_dir = get_template_directory(&app);
    let template_path = Path::new(&path);
    let active_path = ensure_templates_exist(&app)?;

    let canonical_path = template_path.canonicalize().map_err(|e| e.to_string())?;
    let canonical_dir = template_dir.canonicalize().map_err(|e| e.to_string())?;
    let canonical_active = active_path.canonicalize().unwrap_or(active_path);

    if !canonical_path.starts_with(&canonical_dir) {
        return Err("Invalid template path".to_string());
    }
    if canonical_path == canonical_active {
        return Err("Cannot delete active template".to_string());
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
    if path.starts_with(BUNDLED_PREFIX) {
        return Err("Cannot rename a bundled template".to_string());
    }

    let template_dir = get_template_directory(&app);
    let template_path = Path::new(&path);
    let active_path = ensure_templates_exist(&app)?;

    let canonical_path = template_path.canonicalize().map_err(|e| e.to_string())?;
    let canonical_dir = template_dir.canonicalize().map_err(|e| e.to_string())?;
    let canonical_active = active_path.canonicalize().unwrap_or(active_path);

    if !canonical_path.starts_with(&canonical_dir) {
        return Err("Invalid template path".to_string());
    }
    if canonical_path == canonical_active {
        return Err("Cannot rename active template".to_string());
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
