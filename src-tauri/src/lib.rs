mod commands;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            // Seed templates on first run
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = seed_templates(handle).await {
                    log::error!("Failed to seed templates: {}", e);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            save_invoice,
            get_invoice_template,
            get_template_path,
            save_template,
            reset_template,
            get_recent_templates,
            load_template_from_path,
            delete_template,
            rename_template,
            export_data,
            import_data,
            seed_templates,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
