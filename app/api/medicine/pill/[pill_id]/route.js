import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function PUT(req, { params }) {
  const { pill_id } = params;
  const { pillName, dose, typeName, unitId, status } = await req.json(); // รับค่า pillName, dose, typeName, unitId และ status

  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    let query;
    let queryParams;

    // เช็คว่า status เป็น 0 หรือ 1
    if (status === 0 || status === 1) {
      query = `
        UPDATE pill
        SET status = ?
        WHERE pill_id = ?
      `;
      queryParams = [status, pill_id];
    } else {
      // ถ้า status ไม่ใช่ 0 หรือ 1 ก็จะทำการอัปเดต pill_name, dose, type_name, และ unit_id
      query = `
        UPDATE pill
        SET pill_name = ?, dose = ?, type_id = (SELECT type_id FROM pill_type WHERE type_name = ?), unit_id = ?
        WHERE pill_id = ?
      `;
      queryParams = [pillName, dose, typeName, unitId, pill_id];
    }

    // ทำการ execute คำสั่ง SQL
    const [result] = await connection.query(query, queryParams);

    if (result.affectedRows === 0) {
      console.log(`Pill with id ${pill_id} not found`);
      return NextResponse.json({ message: 'Pill not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Pill updated successfully' });
  } catch (error) {
    console.error('Error updating pill:', error);
    return NextResponse.json({ message: 'Error updating pill' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
