import { createClient } from "@libsql/client";

const TABLE_NAME = "note";

const tursoClient = createClient({
  url: process.env.TURSO_URL || "",
  authToken: process.env.TURSO_TOKEN || "",
});

function escaparComillasSimples(texto: string) {
  // Reemplazar cada comilla simple con dos comillas simples
  return texto.replace(/'/g, "''");
}

export async function GET(
  request: Request,
  { params }: { params: { user: string } }
) {
  try {
    const results = await tursoClient.execute(
      `SELECT * FROM ${TABLE_NAME} where usuario = '${params.user}'`
    );

    return new Response(JSON.stringify(results.rows), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log("Get Error: ", error);
    return new Response(`Get error: ${(error as Error).message}`, {
      status: 400,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = `INSERT INTO ${TABLE_NAME} 
    (id, noteText, noteHTML, noteTitle, tags, category, deleted, archived, reminder, rating, created, modified, usuario) 
    VALUES (
      '${body.id}', 
      '${escaparComillasSimples(body.noteText)}', 
      '${escaparComillasSimples(body.noteHTML)}',
      '${escaparComillasSimples(body.noteTitle)}',
      '${body.tags}',
      '${body.category}',
      ${body.deleted},
      ${body.archived},
      '${body.reminder}',
      ${body.rating},
      '${body.created}',
      '${body.modified}',
      '${body.usuario}'
    )`;

    const results = await tursoClient.execute(query);

    return new Response(JSON.stringify(results.rowsAffected), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Added CORS header
        "Access-Control-Allow-Methods": "POST", // Added CORS header
        "Access-Control-Allow-Headers": "Content-Type", // Added CORS header
      },
    });
  } catch (error) {
    console.log("Post Error: ", error);
    return new Response(`Post error: ${(error as Error).message}`, {
      status: 400,
    });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const query = `UPDATE ${TABLE_NAME} SET id = '${body.id}', 
    noteText = '${escaparComillasSimples(body.noteText)}', 
    noteHTML = '${escaparComillasSimples(body.noteHTML)}', 
    noteTitle = '${escaparComillasSimples(body.noteTitle)}',
    tags = '${body.tags}',
    category = '${body.category}',
    deleted = ${body.deleted},
    archived = ${body.archived},
    reminder = '${body.reminder}',
    rating = ${body.rating},
    created = '${body.created}',
    modified = '${body.modified}',
    usuario = '${body.usuario}'
    WHERE id = '${body.id}'`;

    const results = await tursoClient.execute(query);

    return new Response(JSON.stringify(results.rowsAffected), {
      status: 201,
    });
  } catch (error) {
    console.log("Put Error: ", error);
    return new Response(`Put error: ${(error as Error).message}`, {
      status: 400,
    });
  }
}

// TODO: ojo, params.user en realidad acá está trayendo el id de la nota. Para dejarlo bien ordenado el endpoint debería estar dentro de /[user]/[Id]. o bien organizado de otro modo para que sea tipo api/delete/[Id]

export async function DELETE(
  request: Request,
  { params }: { params: { user: string } }
) {
  try {
    const query = `DELETE FROM ${TABLE_NAME} WHERE id = '${params.user}'`;

    const results = await tursoClient.execute(query);
    return new Response(null, {
      status: 204,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("Delete Error: ", error);
    return new Response(`Delete error: ${(error as Error).message}`, {
      status: 400,
    });
  }
}
