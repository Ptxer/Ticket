// pages/api/report.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function GET() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    const [patientRecords] = await connection.query(`
      SELECT * FROM patientrecord
    `);

    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const [symptomStats] = await connection.query(`
      SELECT sr.symptom_id, COUNT(*) as count, s.symptom_name
      FROM symptomrecord sr
      JOIN symptom s ON sr.symptom_id = s.symptom_id
      JOIN patientrecord pr ON sr.patientrecord_id = pr.patientrecord_id
      WHERE pr.datetime >= ?
      GROUP BY sr.symptom_id
      ORDER BY count DESC
      LIMIT 12
    `, [startOfWeek.toISOString().slice(0, 19).replace('T', ' ')]);

    const [pillStats] = await connection.query(`
      SELECT ps.pillstock_id, COUNT(pr.pillstock_id) as count, p.pill_name, p.dose
      FROM pillrecord pr
      JOIN patientrecord prd ON pr.patientrecord_id = prd.patientrecord_id
      JOIN pillstock ps ON pr.pillstock_id = ps.pillstock_id
      JOIN pill p ON ps.pill_id = p.pill_id
      WHERE prd.datetime >= ? AND prd.datetime < ?
      GROUP BY ps.pillstock_id, p.pill_name, p.dose
      ORDER BY count DESC
      LIMIT 7
    `, [startOfMonth.toISOString().slice(0, 19).replace('T', ' '), endOfMonth.toISOString().slice(0, 19).replace('T', ' ')]);
    

    const todayDate = new Date();
    const startTime = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 0, 0, 0);
    const endTime = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 23, 59, 59);

    const startTimeGMT7 = new Date(startTime.getTime() + (7 * 60 * 60 * 1000));
    const endTimeGMT7 = new Date(endTime.getTime() + (7 * 60 * 60 * 1000));

    const [rawPatientRecords] = await connection.query(`
      SELECT *
      FROM patientrecord
      WHERE datetime BETWEEN ? AND ?
    `, [startTimeGMT7.toISOString().slice(0, 19).replace('T', ' '), endTimeGMT7.toISOString().slice(0, 19).replace('T', ' ')]);

    const [patientRecordCounts] = await connection.query(`
      SELECT HOUR(datetime) as hour, COUNT(*) as record_count
      FROM patientrecord
      WHERE datetime BETWEEN ? AND ?
      GROUP BY HOUR(datetime)
      ORDER BY hour
    `, [startTimeGMT7.toISOString().slice(0, 19).replace('T', ' '), endTimeGMT7.toISOString().slice(0, 19).replace('T', ' ')]);

    const chartData = Array.from({ length: 24 }, (_, i) => {
      const row = patientRecordCounts.find(r => r.hour === i);
      return {
        hour: `${i}:00`,
        record_count: row ? row.record_count : 0,
      };
    });

    return NextResponse.json({
      patientRecords,
      symptomStats,
      pillStats,
      chartData,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}