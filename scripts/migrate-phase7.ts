import Database from 'better-sqlite3';
import path from 'path';

function migrate() {
    console.log("🛠️ Başlatılıyor: Viktor.db Şema Güncellemesi (Faz 7)");
    const dbPath = path.join(process.cwd(), 'src', 'data', 'viktor.db');

    try {
        const db = new Database(dbPath);

        // Define new columns and their default JSON string values
        const columnsToAdd = [
            { name: 'features', type: 'TEXT', default: '[]' },
            { name: 'downloads', type: 'TEXT', default: '[]' },
            { name: 'videos', type: 'TEXT', default: '[]' }
        ];

        // Check existing columns to avoid duplicate column errors
        const tableInfo = db.pragma("table_info(products)") as any[];
        const existingColumns = tableInfo.map(col => col.name);

        let addedCount = 0;

        for (const col of columnsToAdd) {
            if (!existingColumns.includes(col.name)) {
                console.log(`Eklenecek yeni kolon: ${col.name}`);
                // Add column
                db.prepare(`ALTER TABLE products ADD COLUMN ${col.name} ${col.type}`).run();

                // Initialize existing rows with a valid empty JSON array
                db.prepare(`UPDATE products SET ${col.name} = ? WHERE ${col.name} IS NULL`).run(col.default);
                addedCount++;
                console.log(`✅ Kolon eklendi ve varsayılan JSON veri ile güncellendi: ${col.name}`);
            } else {
                console.log(`⏩ Kolon zaten mevcut, atlanıyor: ${col.name}`);
            }
        }

        db.close();

        if (addedCount > 0) {
            console.log(`\n🎉 Şema Güncellemesi Başarılı! (${addedCount} Kolon Eklendi)`);
        } else {
            console.log(`\n✅ Mevcut Şema Zaten Güncel. Değişiklik Yapılmadı.`);
        }

    } catch (error) {
        console.error("❌ Kritik Şema Göçü Hatası:", error);
    }
}

migrate();
