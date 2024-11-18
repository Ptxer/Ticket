import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function GET(request, { params }) {
  const { pillstock_id } = params;

  if (!pillstock_id) {
    return new Response(JSON.stringify({ error: 'Pillstock ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `SELECT * FROM pillstock WHERE pillstock_id = ?`,
      [pillstock_id]
    );

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Pill not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(rows[0]), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function PUT(request, { params }) {
  const { pillstock_id } = params;
  let body;

  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { total } = body;

  if (!pillstock_id) {
    return new Response(JSON.stringify({ error: 'Pillstock ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (typeof total !== 'number' || total < 0) {
    return new Response(JSON.stringify({ error: 'Invalid total value' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      `
      UPDATE pillstock
      SET total = ?
      WHERE pillstock_id = ?
      `,
      [total, pillstock_id]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'Pill not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Pill updated successfully' }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function updatePill(request, { params }) {
  const { pillstock_id } = params;
  let body;

  try {
    body = await request.json();
    console.log('Received body:', body); // Log the received body
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { pillName, dose, typeName, expireDate, total, unit } = body;

  if (!pillstock_id) {
    return new Response(JSON.stringify({ error: 'Pillstock ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (typeof total !== 'number' || total < 0) {
    return new Response(JSON.stringify({ error: 'Invalid total value' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      `
      UPDATE pillstock
      SET pill_name = ?, dose = ?, type_name = ?, expire = ?, total = ?, unit_type = ?
      WHERE pillstock_id = ?
      `,
      [pillName, dose, typeName, expireDate, total, unit, pillstock_id]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'Pill not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Pill updated successfully' }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}