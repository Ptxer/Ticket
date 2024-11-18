import mysql from "mysql2/promise";

export async function POST(req) {
  const { pillName, dose, typeName, unit } = await req.json();

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

    // If pill already exists, return an error
    if (existingPill.length > 0) {
      return new Response(
        JSON.stringify({ error: "Pill already exists" }),
        { status: 400 }
      );
    }

    // ตรวจสอบว่า typeName ที่ได้รับมาคือ type_id หรือ type_name
    const [typeExists] = await connection.execute(
      'SELECT type_id FROM pill_type WHERE type_id = ?',
      [typeName]  // รับค่าที่เป็น type_id
    );

    if (typeExists.length === 0) {
      return new Response(
        JSON.stringify({ error: `Invalid type id: ${typeName}` }),
        { status: 400 }
      );
    }

    // Check if unit exists in unit table
    const [unitExists] = await connection.execute(
      'SELECT unit_id FROM unit WHERE unit_type = ?',
      [unit]
    );

    if (unitExists.length === 0) {
      return new Response(
        JSON.stringify({ error: `Invalid unit type: ${unit}` }),
        { status: 400 }
      );
    }

    // If both typeName and unit are valid, insert the new pill
    const [pillResult] = await connection.execute(
      'INSERT INTO pill (pill_name, dose, type_id, unit_id, status) VALUES (?, ?, ?, ?, 1)',
      [pillName, dose, typeExists[0].type_id, unitExists[0].unit_id]
    );

    const pillId = pillResult.insertId;

    await connection.commit();
    return new Response(
      JSON.stringify({ message: 'Pill added successfully', pillId }),
      { status: 200 }
    );
  } catch (err) {
    await connection.rollback();
    return new Response(
      JSON.stringify({ error: 'Failed to add pill' }),
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}
