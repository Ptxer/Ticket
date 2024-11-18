import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function GET(request, { params }) {
  const { ticket_id } = params;

  if (!ticket_id) {
    return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [ticketRows] = await connection.execute(
      `
      SELECT pa.patientrecord_id, pa.datetime, pa.status, p.patient_name
      FROM patientrecord pa
      JOIN patient p ON pa.patient_id = p.patient_id
      WHERE pa.patientrecord_id = ?
      `,
      [ticket_id]
    );

    if (ticketRows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    
    const ticket = ticketRows[0];

    const [symptomsRows] = await connection.execute(
      `
      SELECT sr.patientrecord_id, sy.symptom_name
      FROM symptomrecord sr
      JOIN symptom sy ON sr.symptom_id = sy.symptom_id
      WHERE sr.patientrecord_id = ?
      `,
      [ticket_id]
    );

    return NextResponse.json({ ...ticket, symptoms: symptomsRows }, { status: 200 });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function DELETE(request, { params }) {
  const { ticket_id } = params;

  if (!ticket_id) {
    return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();


    await connection.execute(
      `
      DELETE FROM symptomrecord
      WHERE patientrecord_id = ?
      `,
      [ticket_id]
    );

    const [result] = await connection.execute(
      `
      DELETE FROM patientrecord
      WHERE patientrecord_id = ?
      `,
      [ticket_id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    await connection.commit();
    return NextResponse.json({ message: 'Ticket and related symptom records deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Database error:', error);
    if (connection) {
      await connection.rollback();
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}