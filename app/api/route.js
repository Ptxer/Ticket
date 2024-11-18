import mysql from 'mysql2/promise';

export async function POST(request) {
  try {
    const { student_id, student_name, role, symptom_ids, other_symptom } = await request.json();

    const roleMapping = {
      นักศึกษา: 1,
      บุคลากร: 2,   
      บุคคลภายนอก: 3 
    };

    const patienttype_id = roleMapping[role];

    if (patienttype_id === undefined) {
      throw new Error('Invalid role');
    }

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // Check if the patient already exists
    const checkSql = `
      SELECT COUNT(*) AS count FROM patient WHERE patient_id = ?
    `;
    const [rows] = await connection.execute(checkSql, [student_id]);
    const { count } = rows[0];

    // Insert patient if not exists
    if (count === 0) {
      const insertPatientSql = `
        INSERT INTO patient (patient_id, patient_name, patienttype_id) 
        VALUES (?, ?, ?)
      `;
      await connection.execute(insertPatientSql, [student_id, student_name, patienttype_id]);
    }

    // Insert into patientrecord table
    const insertPatientRecordSql = `
      INSERT INTO patientrecord (patient_id) 
      VALUES (?)
    `;
    const [patientRecordResult] = await connection.execute(insertPatientRecordSql, [student_id]);
    const patient_record_id = patientRecordResult.insertId;

    // Insert into symptomrecord table
    const insertSymptomSql = `
      INSERT INTO symptomrecord (patientrecord_id, symptom_id, other_symptom) 
      VALUES (?, ?, ?)
    `;
    for (const symptom_id of symptom_ids) {
      await connection.execute(insertSymptomSql, [patient_record_id, symptom_id, other_symptom]);
    }

    await connection.end();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Error inserting data:', err);
    return new Response(JSON.stringify({ error: 'Failed to insert data' }), { status: 500 });
  }
}