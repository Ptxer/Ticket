import mysql from "mysql2/promise";

export async function POST(req) {
  const { pillName, dose, typeName, expireDate, total, unit } = await req.json();

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  await connection.beginTransaction();

  try {
    // Check if the pill already exists
    const [existingPill] = await connection.execute(
      'SELECT pill_id FROM pill WHERE pill_name = ?',
      [pillName]
    );

    let pillId;

    if (existingPill.length > 0) {
      // Pill already exists, use the existing pill_id
      pillId = existingPill[0].pill_id;
    } else {
      // Pill does not exist, insert a new record
      const [pillResult] = await connection.execute(
        'INSERT INTO pill (pill_name, dose, type_id, unit_id) VALUES (?, ?, ?, ?)',
        [pillName, dose, typeName, unit]
      );
      pillId = pillResult.insertId;
    }

    // Insert into pillstock table
    await connection.execute(
      'INSERT INTO pillstock (pill_id, expire, total) VALUES (?, ?, ?)',
      [pillId, expireDate, total]
    );

    await connection.commit();
    return new Response(JSON.stringify({ message: 'Data saved successfully' }), { status: 200 });
  } catch (err) {
    await connection.rollback();
    return new Response(JSON.stringify({ error: 'Failed to save data' }), { status: 500 });
  } finally {
    await connection.end();
  }
}