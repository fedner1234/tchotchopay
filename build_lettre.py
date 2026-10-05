from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                HRFlowable, Table, TableStyle)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT

OUTPUT = '/sessions/upbeat-pensive-pascal/mnt/tchotchopay/TPMT-Lettre-MCI-Corrigee.pdf'

doc = SimpleDocTemplate(OUTPUT, pagesize=A4,
    leftMargin=2.5*cm, rightMargin=2.5*cm,
    topMargin=2*cm, bottomMargin=2*cm)

BLACK = colors.HexColor('#1a1a1a')
NAVY  = colors.HexColor('#0A1F6E')
RED   = colors.HexColor('#CC0000')

def ms(name, **kw):
    base = getSampleStyleSheet()['Normal']
    return ParagraphStyle(name, parent=base, **kw)

HDR_NAME  = ms('HN', fontSize=14, fontName='Helvetica-Bold', textColor=NAVY, alignment=TA_CENTER, spaceAfter=2)
HDR_SUB   = ms('HS', fontSize=10, fontName='Helvetica-Bold', textColor=RED,  alignment=TA_CENTER, spaceAfter=2)
DATE_S    = ms('DS', fontSize=10, fontName='Helvetica', textColor=BLACK, alignment=TA_RIGHT, spaceAfter=12)
DEST_S    = ms('DE', fontSize=10, fontName='Helvetica-Bold', textColor=BLACK, alignment=TA_LEFT, spaceAfter=2)
OBJET_S   = ms('OB', fontSize=10, fontName='Helvetica-Bold', textColor=BLACK, spaceAfter=14)
SAL_S     = ms('SA', fontSize=10, fontName='Helvetica-Bold', textColor=BLACK, spaceAfter=8)
BODY_S    = ms('BO', fontSize=10, fontName='Helvetica', textColor=BLACK, leading=17,
               spaceAfter=10, alignment=TA_JUSTIFY, firstLineIndent=1*cm)
CLOSE_S   = ms('CL', fontSize=10, fontName='Helvetica', textColor=BLACK, leading=17,
               spaceAfter=6, alignment=TA_JUSTIFY)
SIG_NAME  = ms('SG', fontSize=10, fontName='Helvetica-Bold', textColor=BLACK, alignment=TA_CENTER, spaceAfter=2)
SIG_LINE  = ms('SL', fontSize=10, fontName='Helvetica', textColor=BLACK, alignment=TA_CENTER, spaceAfter=6)

st = []

def hr(thick=1.5, color=NAVY): return HRFlowable(width='100%', thickness=thick, color=color)
def sp(h=8): return Spacer(1, h)

# ─── LETTERHEAD ───────────────────────────────────────────────────────────────
st.append(Paragraph('TCHOTCHOPAY MAISON DE TRANSFERT ECO (TPMT)', HDR_NAME))
st.append(Paragraph('Fondé le 14 septembre 2026', HDR_SUB))
st.append(Paragraph('25, rue Jacquet Toto, Delmas 95, Haïti', HDR_SUB))
st.append(Paragraph('Tél. : (+509) ______________________ &nbsp;&nbsp;|&nbsp;&nbsp; hello@tchotchopay.com', HDR_SUB))
st.append(sp(4))
st.append(hr(2.5, NAVY))
st.append(hr(0.8, RED))
st.append(sp(16))

# ─── DATE ─────────────────────────────────────────────────────────────────────
st.append(Paragraph('Port-au-Prince, le 14 septembre 2026', DATE_S))
st.append(sp(10))

# ─── RECIPIENT ────────────────────────────────────────────────────────────────
st.append(Paragraph('Au : Service Juridique du Ministère du Commerce et de l\'Industrie', DEST_S))
st.append(Paragraph('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Monsieur James MONAZARD', DEST_S))
st.append(Paragraph('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Directeur du Service Juridique', DEST_S))
st.append(Paragraph('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;En ses Bureaux.-', DEST_S))
st.append(sp(14))

# ─── OBJECT ───────────────────────────────────────────────────────────────────
st.append(Paragraph(
    'Objet : Dépôt de statuts et demande d\'immatriculation de société en nom collectif',
    OBJET_S))
st.append(sp(6))

# ─── SALUTATION ───────────────────────────────────────────────────────────────
st.append(Paragraph('Monsieur le Directeur,', SAL_S))

# ─── BODY ─────────────────────────────────────────────────────────────────────
st.append(Paragraph(
    'J\'ai l\'honneur de vous remettre, sous ce couvert aux fins de droit, deux (2) originaux '
    'des statuts de la société en nom collectif dénommée <b>« Tchotchopay Maison de Transfert '
    'ECO (TPMT) »</b>, devant opérer sous la raison sociale <b>Tchotchopay ECO</b>.',
    BODY_S))

st.append(Paragraph(
    'Cette société a pour objet principal la fourniture de services financiers et technologiques '
    'numériques, notamment le transfert de fonds nationaux et internationaux par voie électronique, '
    'la gestion de portefeuilles de paiement électronique, les rechargements téléphoniques, le '
    'paiement de factures de services publics, ainsi que la mise à disposition de solutions de '
    'paiement pour les commerçants et les particuliers en Haïti et à l\'étranger.',
    BODY_S))

st.append(Paragraph(
    'Je vous saurais gré de bien vouloir accorder à ce dossier le bénéfice de l\'urgence, '
    'en vue de permettre aux fondateurs de cette société de débuter leurs activités dans les '
    'plus brefs délais.',
    BODY_S))

st.append(Paragraph(
    'Dans l\'espoir qu\'une suite favorable sera donnée à la présente requête, je vous prie '
    'd\'agréer, Monsieur le Directeur, l\'expression de ma haute considération.',
    BODY_S))

st.append(sp(30))

# ─── SIGNATURE (founder only) ─────────────────────────────────────────────────
sig_data = [
    ['______________________________'],
    ['Jean Fedner François'],
    ['Associé Fondateur — 80% du capital social'],
    ['Tchotchopay Maison de Transfert ECO (TPMT)'],
]
t = Table(sig_data, colWidths=[9*cm])
t.setStyle(TableStyle([
    ('FONTNAME',  (0,0),(0,0), 'Helvetica'),
    ('FONTNAME',  (0,1),(0,1), 'Helvetica-Bold'),
    ('FONTNAME',  (0,2),(0,3), 'Helvetica'),
    ('FONTSIZE',  (0,0),(-1,-1), 10),
    ('ALIGN',     (0,0),(-1,-1), 'CENTER'),
    ('TOPPADDING',(0,0),(-1,-1), 3),
    ('BOTTOMPADDING',(0,0),(-1,-1), 3),
]))
st.append(t)
st.append(sp(30))

# ─── FOOTER ───────────────────────────────────────────────────────────────────
st.append(hr(0.8, colors.HexColor('#AAAAAA')))
st.append(sp(4))
note = ms('FT', fontSize=8, fontName='Helvetica-Oblique',
          textColor=colors.HexColor('#666666'), alignment=TA_CENTER)
st.append(Paragraph(
    'Pièce jointe : Deux (2) originaux des statuts de la société — Tchotchopay Maison de Transfert ECO (TPMT)',
    note))

doc.build(st)
print("Done:", OUTPUT)
