import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ND usa exclusivamente la cuenta de usuario activa de gcloud para el destino.
// credentials.json continúa reservado para lectura de Drive/origen.
const auth=new OAuth2Client();
(auth as any).getAccessToken=async()=>({token:execFileSync('gcloud',['auth','print-access-token'],{encoding:'utf8'}).trim()});
export const sheets=google.sheets({version:'v4',auth: auth as any});
let SPREADSHEET_ID=process.env.ND_GOOGLE_SHEETS_ID||'';
const ID_FILE=path.join(process.cwd(),'checkpoints','ND_GOOGLE_SHEETS_ID');
function leerId(){try{return fs.existsSync(ID_FILE)?fs.readFileSync(ID_FILE,'utf8').trim():''}catch{return ''}}
function guardarId(id:string){const d=path.dirname(ID_FILE);if(!fs.existsSync(d))fs.mkdirSync(d,{recursive:true});fs.writeFileSync(ID_FILE,id+'\n','utf8')}
export async function prepararConexionSheetsND():Promise<string>{
 if(SPREADSHEET_ID)return SPREADSHEET_ID;
 SPREADSHEET_ID=leerId();if(SPREADSHEET_ID){console.log(`   📊 ND -> Google Sheets existente: ${SPREADSHEET_ID}`);return SPREADSHEET_ID}
 const drive=google.drive({version:'v3',auth: auth as any});
 const about=await drive.about.get({fields:'user(emailAddress)'});
 console.log(`   👤 ND Sheets autenticado como: ${about.data.user?.emailAddress||'cuenta activa'}`);
 const creado=await sheets.spreadsheets.create({requestBody:{properties:{title:'ARKON ND - Extracción'}}});
 const id=creado.data.spreadsheetId;if(!id)throw new Error('Google Sheets no devolvió spreadsheetId.');
 SPREADSHEET_ID=id;guardarId(id);console.log(`   🆕 Hoja ND creada: ${id}`);return id;
}
export function getNDSpreadsheetId():string{if(!SPREADSHEET_ID)throw new Error('Sheets ND no preparado.');return SPREADSHEET_ID}
