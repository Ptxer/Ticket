import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function POST(req) {
  const { pillName, dose, typeName, unitType } = await req.json();  // no need to pass status anymore

  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    const [typeResult] = await connection.query(
      'SELECT type_id FROM pill_type WHERE type_name = ?',
      [typeName]
    );

    if (typeResult.length === 0) {
      return NextResponse.json({ message: 'Invalid type name' }, { status: 400 });
    }

    const typeId = typeResult[0].type_id;

    const [unitResult] = await connection.query(
      'SELECT unit_id FROM unit WHERE unit_type = ?',
      [unitType]
    );

    if (unitResult.length === 0) {
      return NextResponse.json({ message: 'Invalid unit type' }, { status: 400 });
    }

    const unitId = unitResult[0].unit_id;

    const [existingPill] = await connection.execute(
      'SELECT pill_id FROM pill WHERE pill_name = ?',
      [pillName]
    );

    let pillId;

    if (existingPill.length > 0) {
      pillId = existingPill[0].pill_id;
    } else {
      const [pillResult] = await connection.execute(
        'INSERT INTO pill (pill_name, dose, type_id, unit_id) VALUES (?, ?, ?, ?)',  // No need for status here
        [pillName, dose, typeId, unitId]
      );
      pillId = pillResult.insertId;
    }

    await connection.commit();
    return NextResponse.json({ message: 'Data saved successfully', pillId }, { status: 200 });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error saving data:', err);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
