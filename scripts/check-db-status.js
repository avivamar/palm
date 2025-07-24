const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
});

const db = drizzle(sql);

(async () => {
  try {
    console.log('=== 数据库状态检查 ===');

    // 检查所有表
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log('\n数据库中的表:');
    if (tables.length === 0) {
      console.log('- 没有找到任何表');
    } else {
      tables.forEach(row => console.log(`- ${row.table_name}`));
    }

    // 检查迁移记录
    try {
      const migrations = await sql`
        SELECT id, hash, created_at 
        FROM drizzle.__drizzle_migrations 
        ORDER BY created_at DESC 
        LIMIT 10
      `;

      console.log('\n迁移记录:');
      if (migrations.length === 0) {
        console.log('- 没有找到任何迁移记录');
      } else {
        migrations.forEach((row) => {
          console.log(`- ${row.id}: ${row.hash} (${row.created_at})`);
        });
      }
    } catch (migrationError) {
      console.log('\n迁移表不存在或查询失败:', migrationError.message);
    }

    // 检查枚举类型
    const enums = await sql`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      ORDER BY typname
    `;

    console.log('\n枚举类型:');
    if (enums.length === 0) {
      console.log('- 没有找到任何枚举类型');
    } else {
      enums.forEach(row => console.log(`- ${row.typname}`));
    }

    await sql.end();
    console.log('\n=== 检查完成 ===');
  } catch (error) {
    console.error('数据库检查失败:', error.message);
    console.error('错误详情:', error);
    process.exit(1);
  }
})();
