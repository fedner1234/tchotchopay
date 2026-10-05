from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                HRFlowable, PageBreak, Table, TableStyle)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

OUTPUT = '/sessions/upbeat-pensive-pascal/mnt/tchotchopay/TPMT-Statuts-Corriges.pdf'

doc = SimpleDocTemplate(OUTPUT, pagesize=A4,
    leftMargin=2.5*cm, rightMargin=2.5*cm,
    topMargin=2.5*cm, bottomMargin=2.5*cm)

BLACK = colors.HexColor('#1a1a1a')
DARK  = colors.HexColor('#0A1F6E')
GRAY  = colors.HexColor('#555555')

def s(name, **kw):
    base = getSampleStyleSheet()['Normal']
    return ParagraphStyle(name, parent=base, **kw)

TITLE   = s('T',  fontSize=16, fontName='Helvetica-Bold', textColor=BLACK, alignment=TA_CENTER, spaceAfter=4)
TITLE2  = s('T2', fontSize=13, fontName='Helvetica-Bold', textColor=BLACK, alignment=TA_CENTER, spaceAfter=6)
TITLE3  = s('T3', fontSize=11, fontName='Helvetica-Bold', textColor=BLACK, alignment=TA_CENTER, spaceAfter=10)
SECTION = s('SC', fontSize=11, fontName='Helvetica-Bold', textColor=DARK,  alignment=TA_CENTER, spaceBefore=14, spaceAfter=6)
ART     = s('AR', fontSize=10.5, fontName='Helvetica-Bold', textColor=BLACK, spaceBefore=10, spaceAfter=4)
BODY    = s('BO', fontSize=10, fontName='Helvetica', textColor=BLACK, leading=16, spaceAfter=4, alignment=TA_JUSTIFY)
BULLET  = s('BU', fontSize=10, fontName='Helvetica', textColor=BLACK, leading=16, spaceAfter=3, leftIndent=18, bulletIndent=8, alignment=TA_JUSTIFY)
NOTE    = s('NT', fontSize=8.5, fontName='Helvetica-Oblique', textColor=GRAY, spaceAfter=4, alignment=TA_CENTER)
CENTER  = s('CE', fontSize=10, fontName='Helvetica', textColor=BLACK, alignment=TA_CENTER, spaceAfter=4)

st = []

def hr(): return HRFlowable(width='100%', thickness=0.8, color=BLACK)
def sp(h=6): return Spacer(1, h)

# COVER
st += [sp(30), Paragraph('STATUTS DE LA SOCIÉTÉ', TITLE), sp(8),
       hr(), sp(6),
       Paragraph('TCHOTCHOPAY MAISON DE TRANSFERT ECO', TITLE2), sp(4),
       Paragraph('Société en nom collectif', TITLE3), sp(4),
       hr(), sp(20)]

st.append(Paragraph('<b><u>ENTRE LES SOUSSIGNÉS :</u></b>', BODY))
st.append(sp(6))

associates = [
    ('1', 'Jean Fedner François', '26 juin 1982', 'la Croix-des-Bouquets', '007-794-721-8', False),
    ('2', 'Fabian Francois', '29 janvier 2008', 'USA', '___-___-___-_', False),
    ('3', 'Noël Freguens', '12 décembre 1976', 'Limbé', '003-813-662-4', False),
    ('4', 'Judes Dorméus', '26 septembre 1977', 'Limbé', '008-152-364-2', False),
    ('5', 'Ramilène Jean Jacques', '23 juin 1979', 'Jean Rabel', '008-277-346-2', True),
    ('6', 'Jean Sony François', '18 juillet 1983', 'la Croix-des-Bouquets', '003-000-000-5', False),
]
for n, name, dob, city, nif, female in associates:
    genre = 'née' if female else 'né'
    dom = 'domiciliée' if female else 'domicilié'
    idf = 'identifiée' if female else 'identifié'
    if city == 'USA':
        lieu = 'aux États-Unis d\'Amérique'
        nationalite = 'de nationalité américaine'
    else:
        lieu = f'à {city}, Haïti'
        nationalite = 'de nationalité haïtienne'
    st.append(Paragraph(
        f'{n}.- <b>{name}</b> {genre} le {dob} {lieu}, propriétaire, '
        f'demeurant et {dom} aux États-Unis d\'Amérique, '
        f'{nationalite}, {idf} au numéro : <b>{nif}</b> ;', BODY))
    st.append(sp(4))

st.append(PageBreak())

# PREAMBLE
st += [sp(10), Paragraph('<b>IL A ÉTÉ ÉTABLI LES PRÉSENTS STATUTS</b>', CENTER), sp(10)]

# TITRE I
st.append(Paragraph('Titre I – FORME – DÉNOMINATION – OBJET ET SIÈGE SOCIAL', SECTION))
st.append(hr()); st.append(sp(6))

st.append(Paragraph('<u>Art.-1.- Forme :</u>', ART))
st.append(Paragraph(
    'Il est constitué entre les propriétaires des parts sociales ci-après créées et de celles qui '
    'pourront l\'être ultérieurement une société dénommée <b>« Tchotchopay Maison de Transfert ECO '
    '(TPMT) »</b>, constituée sous la forme de société en nom collectif, régie par les lois en '
    'vigueur de la République d\'Haïti et par les présents statuts.', BODY))

st.append(Paragraph('<u>Art.-2.- Dénomination :</u>', ART))
st.append(Paragraph(
    'La société prend la dénomination : <b>« Tchotchopay Maison de Transfert ECO (TPMT) »</b>', BODY))
st.append(Paragraph(
    'Dans tous les actes, factures, correspondances et documents émanant de la société, la '
    'dénomination sociale devra être accompagnée de la mention relative à sa forme juridique et, '
    'le cas échéant, de son capital social.', BODY))

# ART 3 — FULLY CORRECTED (no USDC, no crypto, BRH added, fixed typo)
st.append(Paragraph('<u>Art.-3.- Objet Social :</u>', ART))
st.append(Paragraph(
    'La société a pour objet principal la fourniture de services financiers et technologiques '
    'numériques destinés aux particuliers, aux commerçants et aux entreprises, notamment :', BODY))

art3 = [
    'La conception, le développement, la gestion et l\'exploitation de plateformes numériques de '
    'transfert de fonds et de paiement électronique, à l\'échelle nationale et internationale ;',
    'La fourniture de services de transfert d\'argent nationaux et internationaux par voie '
    'électronique, permettant l\'<b>envoi</b> et la réception de fonds de manière rapide, '
    'sécurisée et traçable ;',
    'Le développement et la commercialisation de solutions de portefeuille électronique '
    '(<b>wallet</b>) permettant aux utilisateurs de stocker, gérer et transférer des fonds '
    'libellés en <b>instrument de paiement électronique stable équivalent au dollar américain</b>, '
    'émis et réglementé par des institutions financières agréées aux États-Unis d\'Amérique, '
    'conformément aux lois et réglementations en vigueur ;',
    'La création, la maintenance et l\'exploitation de plateformes de paiement numérique '
    'destinées aux particuliers, aux commerçants et aux entreprises, incluant les paiements par '
    'code QR, les transferts entre particuliers et les solutions de points de vente (POS) '
    'électroniques ;',
    'La mise à disposition de services de paiement pour les commerçants, incluant les '
    'rechargements électroniques de crédit téléphonique, le paiement de factures de services '
    'publics (électricité, eau, scolarité) et les transferts de fonds entre particuliers ;',
    'La mise en place et la gestion d\'un réseau d\'agents agréés pour la distribution et le '
    'décaissement de fonds en territoire haïtien, permettant la conversion des fonds '
    'électroniques en monnaie locale ;',
    'La fourniture de services de financement aux particuliers et aux entreprises ;',
    'Et, d\'une manière générale, toutes opérations commerciales, financières, mobilières ou '
    'immobilières se rattachant directement ou indirectement à l\'objet social ci-dessus ou '
    'pouvant en faciliter le développement et la réalisation.',
]
for item in art3:
    st.append(Paragraph(f'&#10070; {item}', BULLET))

st.append(sp(4))
st.append(Paragraph(
    'La société pourra accomplir toutes opérations commerciales, financières, mobilières et '
    'immobilières se rattachant directement ou indirectement à son objet social.', BODY))
st.append(Paragraph(
    'Toute activité nécessitant une autorisation, un agrément ou une licence particulière ne '
    'pourra être exercée qu\'après l\'obtention de ladite autorisation auprès de l\'autorité '
    'compétente, notamment la <b>Banque de la République d\'Haïti (BRH)</b> pour toute activité '
    'réglementée dans le secteur des paiements et des transferts de fonds.', BODY))

st.append(Paragraph('<u>Art.-4.- Siège Social :</u>', ART))
st.append(Paragraph(
    'Le siège social se trouve au Santo 25 route péligre prolongé, #156 Croix-des-Bouquets, Haïti. '
    'Téléphone : +509 37207862.', BODY))
st.append(Paragraph(
    'Il pourra être transféré en tout autre lieu conformément aux dispositions légales et aux '
    'présents statuts. La société pourra établir des succursales, agences, bureaux ou '
    'représentations en tout autre lieu en Haïti ou à l\'étranger, sous réserve des autorisations requises.', BODY))

st.append(Paragraph('<u>Art.-5.- Durée :</u>', ART))
st.append(Paragraph(
    'La société est créée pour une durée de quatre-vingt-dix-neuf (99) ans à courir à partir de '
    'son enregistrement aux registres des sociétés du Ministère du Commerce et de l\'Industrie '
    '(MCI), renouvelable en cas d\'acceptation expresse ou tacite de tous les associés.', BODY))

st.append(PageBreak())

# TITRE II
st.append(Paragraph('TITRE II – CAPITAL SOCIAL ET PARTS SOCIALES', SECTION))
st.append(hr()); st.append(sp(6))

# ART 6 — CORRECTED (80% Fedner, 5% each, correct math)
st.append(Paragraph('<u>Art.-6.- Capital Social :</u>', ART))
st.append(Paragraph(
    'Le capital social autorisé de <b>Tchotchopay Maison de Transfert ECO</b> est de '
    '<b>deux cent mille (200 000) de gourdes</b>, divisé en cent (100) parts sociales '
    'de deux mille (2 000) gourdes chacune. Le capital social souscrit initial est de '
    '<b>cent quarante-quatre mille (144 000) gourdes</b>, représentant soixante-douze (72) parts '
    'sociales souscrites et libérées par les six (6) associés fondateurs, réparties comme suit :', BODY))
st.append(sp(4))

cap_data = [
    ['Associé / Réserve', 'Apport', 'Parts', '%'],
    ['Jean Fedner François — Fondateur & PDG', '70 000 HTG', '35 parts', '35 %'],
    ['Fabian Francois — Co-Fondateur', '10 000 HTG', '5 parts', '5 %'],
    ['Noël Freguens — Associé Fondateur', '16 000 HTG', '8 parts', '8 %'],
    ['Judes Dorméus — Associé Fondateur', '16 000 HTG', '8 parts', '8 %'],
    ['Ramilène Jean Jacques — Associé Fondateur', '16 000 HTG', '8 parts', '8 %'],
    ['Jean Sony François — Associé Fondateur', '16 000 HTG', '8 parts', '8 %'],
    ['SOUS-TOTAL SOUSCRIT', '144 000 HTG', '72 parts', '72 %'],
    ['Réserve — Futurs Investisseurs (à émettre)', '—', '18 parts', '18 %'],
    ['Réserve — Employés & Conseillers (à émettre)', '—', '10 parts', '10 %'],
    ['TOTAL AUTORISÉ', '200 000 HTG', '100 parts', '100 %'],
]
t = Table(cap_data, colWidths=[7*cm, 2.8*cm, 2*cm, 1.7*cm])
t.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(-1,0), colors.HexColor('#020B2D')),
    ('TEXTCOLOR', (0,0),(-1,0), colors.white),
    ('FONTNAME',  (0,0),(-1,0), 'Helvetica-Bold'),
    ('FONTSIZE',  (0,0),(-1,-1), 9),
    ('FONTNAME',  (0,1),(-1,-2), 'Helvetica'),
    ('FONTNAME',  (0,7),(-1,7), 'Helvetica-Bold'),
    ('BACKGROUND',(0,7),(-1,7), colors.HexColor('#D0E8F5')),
    ('FONTNAME',  (0,-1),(-1,-1), 'Helvetica-Bold'),
    ('BACKGROUND',(0,-1),(-1,-1), colors.HexColor('#E8F4FB')),
    ('FONTNAME',  (0,8),(-1,9), 'Helvetica-Oblique'),
    ('TEXTCOLOR', (0,8),(-1,9), colors.HexColor('#555555')),
    ('GRID',      (0,0),(-1,-1), 0.5, colors.HexColor('#AABBCC')),
    ('ROWBACKGROUNDS',(0,1),(- 1,6),[colors.white, colors.HexColor('#F5F9FC')]),
    ('ALIGN',     (1,0),(-1,-1), 'CENTER'),
    ('TOPPADDING',(0,0),(-1,-1), 5),
    ('BOTTOMPADDING',(0,0),(-1,-1), 5),
    ('LEFTPADDING',(0,0),(-1,-1), 6),
]))
st.append(t); st.append(sp(8))

items_6 = [
    'Monsieur <b>Jean Fedner François</b>, en qualité d\'associé fondateur et dirigeant principal, '
    'apporte en espèce la somme de soixante-dix mille (70 000) gourdes, représentant '
    'trente-cinq (35) parts sociales, soit trente-cinq pourcent (35%) du capital autorisé.',
    'Monsieur <b>Fabian Francois</b>, en qualité de co-fondateur, apporte en espèce la somme de '
    'dix mille (10 000) gourdes, représentant cinq (5) parts sociales, soit cinq pourcent '
    '(5%) du capital autorisé.',
    'Chacun des quatre (4) autres associés fondateurs apporte en espèce la somme de seize '
    'mille (16 000) gourdes, représentant huit (8) parts sociales, soit huit pourcent (8%) du '
    'capital autorisé pour chacun.',
    'Dix-huit (18) parts sociales, représentant dix-huit pourcent (18%) du capital autorisé, '
    'sont <b>réservées aux futurs investisseurs</b> et seront émises lors d\'une augmentation '
    'ultérieure du capital, selon les conditions fixées par les associés.',
    'Dix (10) parts sociales, représentant dix pourcent (10%) du capital autorisé, constituent '
    'la <b>réserve pour les employés et conseillers stratégiques</b> de la société, à émettre '
    'selon les modalités définies par le gérant avec l\'accord des associés.',
    'Toute émission de parts réservées devra être approuvée par l\'assemblée générale des associés '
    'à la majorité ordinaire, conformément aux présents statuts.',
]
for i, item in enumerate(items_6):
    st.append(Paragraph(f'{chr(97+i)}) {item}', BULLET))

st.append(Paragraph('<u>Art.-7.- Répartition et Cession des Parts Sociales :</u>', ART))
st.append(Paragraph(
    'La cession des parts sociales, quelle qu\'elle soit, est soumise à l\'agrément des co-associés.', BODY))
items_7 = [
    'Le co-associé doit notifier le projet de cession à chacun des associés par acte extrajudiciaire '
    'ou par lettre recommandée avec avis de réception. Dans les huit (8) jours suivants, '
    'l\'assemblée générale des associés doit être convoquée par le gérant à l\'effet de délibérer '
    'sur ledit projet ; une consultation écrite est également possible.',
    'La décision prise est ensuite communiquée au cédant par lettre recommandée avec avis de réception.',
    'En cas de refus d\'agrément, la cession ne peut se réaliser et le cédant reste propriétaire '
    'des parts concernées.',
    'En cas de décès de l\'un des associés, la société se poursuit librement entre les associés '
    'restants et les ayants-droit ou héritiers, qui doivent justifier leur qualité auprès du gérant.',
    'En cas d\'indivision du fait de cette transmission, l\'un des copropriétaires représente tous '
    'les indivisaires aux assemblées générales ultérieures.',
]
for i, item in enumerate(items_7):
    st.append(Paragraph(f'{chr(97+i)}) {item}', BULLET))

# ART 8 — CORRECTED TITLE + VOTING CONTROL
st.append(Paragraph('<u>Art.-8.- Droits et Obligations des Associés :</u>', ART))
st.append(Paragraph(
    'Chaque part sociale confère à son propriétaire un droit proportionnel sur les bénéfices '
    'réalisés par la société, sur la propriété de l\'actif social et sur le boni de liquidation. '
    'Elle donne également droit à une voix par part dans tous les votes et délibérations.', BODY))
items_8 = [
    '<b>Monsieur Jean Fedner François</b>, en sa qualité d\'associé fondateur et principal '
    'détenant trente-cinq pourcent (35%) du capital souscrit et la direction exécutive de la '
    'société, dispose du pouvoir de décision prépondérant sur toutes les décisions ordinaires '
    'de la société. Aucune décision ordinaire ne peut être adoptée contre sa volonté.',
    'Les associés sont tenus indéfiniment et solidairement des dettes sociales à l\'égard des tiers.',
    'Entre eux, ils ne sont tenus qu\'à concurrence de leurs droits respectifs dans le capital social.',
    'Les décisions ordinaires sont adoptées par les associés représentant plus de la moitié (50%) '
    'des parts sociales. Les décisions extraordinaires sont adoptées à l\'unanimité.',
    'La propriété d\'une part sociale emporte adhésion aux présents statuts et aux résolutions '
    'régulièrement prises par les associés.',
]
for i, item in enumerate(items_8):
    st.append(Paragraph(f'{chr(97+i)}) {item}', BULLET))

st.append(PageBreak())

# TITRE III
st.append(Paragraph('TITRE III – ADMINISTRATION ET DIRECTION', SECTION))
st.append(hr()); st.append(sp(6))

# ART 9 — CORRECTED TITLE
st.append(Paragraph('<u>Art.-9.- Continuité de la Société :</u>', ART))
st.append(Paragraph(
    'La faillite personnelle, l\'incapacité civile, la déconfiture, la liquidation ou le '
    'redressement judiciaire de l\'un des associés n\'entraîne pas la dissolution de la société. '
    'Dans un tel cas, celle-ci se poursuit entre les autres associés restants, à charge par eux '
    'de verser à l\'associé frappé par l\'une desdites mesures la valeur des parts qu\'il possède.', BODY))

# ART 10 — FIXED TYPOS
st.append(Paragraph('<u>Art.-10.- Pouvoirs du Dirigeant :</u>', ART))
st.append(Paragraph(
    'Monsieur <b>_________________________________</b>, demeurant et domicilié à '
    '<b>_________________________________</b>, acceptant les dites fonctions, est nommé en qualité '
    'de gérant ou administrateur de <b>Tchotchopay Maison de Transfert ECO</b> pour une durée '
    'de cinq (5) années qui débuteront à partir de la date de publication d\'un extrait des statuts '
    'dans un journal à grand tirage de la capitale.', BODY))
items_10 = [
    'À cet effet, il peut faire tous les actes de gestion qu\'il juge utile au bon fonctionnement '
    'de la société à l\'égard des tiers. Il dispose des pouvoirs les plus étendus pour représenter '
    'la société, agir en son nom en toutes circonstances sous réserve des pouvoirs que la loi '
    'attribue expressément aux associés. En cas d\'empêchement, il est automatiquement remplacé '
    'par Monsieur/Madame <b>_________________________________</b>.',
    'L\'administrateur ne peut bénéficier de deux mandats consécutifs, <b>sauf</b> si les autres '
    'associés restants ou leurs représentants en font la demande par écrit.',
    'Deux des autres associés ont le pouvoir de limiter par écrit les pouvoirs du gérant '
    '<b>dans</b> les cas des opérations immobilières et d\'emprunts.',
    'Le gérant pourra être révoqué pour juste motif par décision des associés pris à la majorité '
    'absolue. À défaut de révocation justifiée, le gérant peut prétendre au versement de '
    'dommages et intérêts.',
    'Ses fonctions cesseront également par décès, interdiction, déconfiture, faillite personnelle, '
    'incompatibilité, révocation judiciaire ou démission.',
    'La rémunération du gérant sera fixée lors de la plus prochaine assemblée générale ordinaire.',
]
for i, item in enumerate(items_10):
    st.append(Paragraph(f'{chr(97+i)}) {item}', BULLET))

st.append(Paragraph('<u>Art.-11.- Limitations des Pouvoirs :</u>', ART))
st.append(Paragraph(
    'Les décisions collectives sont prises, au choix du gérant, soit en assemblée générale, soit '
    'par consultation écrite des associés. S\'agissant de l\'approbation des comptes annuels, une '
    'assemblée générale ordinaire doit être convoquée, de même que si un associé demande une réunion.', BODY))

st.append(PageBreak())

# TITRE IV — CORRECTED TYPO "ASSOCIÉS"
st.append(Paragraph('TITRE IV – DÉCISIONS DES ASSOCIÉS', SECTION))
st.append(hr()); st.append(sp(6))

st.append(Paragraph('<u>Art.-12.- Assemblées :</u>', ART))
items_12 = [
    'Sont qualifiées d\'ordinaires les décisions des associés autres que celles relatives aux '
    'modifications statutaires. Elles sont adoptées par les associés représentant plus de la '
    'moitié des parts sociales.',
    'Sont qualifiées d\'extraordinaires les décisions ayant pour objet d\'entraîner une '
    'modification des statuts. Elles sont adoptées à l\'unanimité.',
    'Les associés sont convoqués aux assemblées par le gérant par lettre recommandée avec '
    'indication du jour, de l\'heure et de l\'ordre du jour.',
    'L\'assemblée des associés se tient au local ou au siège social, ou en tout autre lieu '
    'indiqué dans la convocation ; elle est présidée par le gérant.',
    'Toute délibération de l\'assemblée des associés est constatée dans un procès-verbal.',
    'Chaque associé a le droit de participer aux décisions collectives et dispose d\'un nombre '
    'de voix égal à celui des parts qu\'il possède. Un associé peut se faire représenter par '
    'la personne de son choix.',
    'Les associés disposent d\'un délai de quinze (15) jours à compter de la date de réception '
    'du projet de résolution pour transmettre leur vote au gérant par lettre recommandée. Tout '
    'associé n\'ayant pas répondu dans ce délai est considéré comme abstenu.',
]
for i, item in enumerate(items_12):
    st.append(Paragraph(f'{chr(97+i)}) {item}', BULLET))

st.append(Paragraph('<u>Art.-13.- Assemblée Générale Ordinaire :</u>', ART))
st.append(Paragraph(
    'Les comptes annuels, l\'inventaire, le rapport de gestion et les rapports spéciaux du gérant '
    'sont établis conformément aux dispositions légales et réglementaires applicables et doivent '
    'être soumis à l\'approbation des associés dans un délai de cinq (5) mois à compter de la '
    'clôture de l\'exercice social.', BODY))

st.append(Paragraph('<u>Art.-14.- Assemblée Générale Extraordinaire :</u>', ART))
st.append(Paragraph(
    'L\'assemblée générale extraordinaire est compétente pour statuer sur toutes modifications '
    'des présents statuts, notamment l\'augmentation ou la réduction du capital social, la '
    'dissolution anticipée de la société, la fusion ou toute autre opération de restructuration. '
    'Les décisions extraordinaires sont adoptées à l\'unanimité des associés.', BODY))

st.append(PageBreak())

# TITRE V
st.append(Paragraph('TITRE V – EXERCICE SOCIAL ET COMPTES', SECTION))
st.append(hr()); st.append(sp(6))

# ART 15 — CORRECTED TITLE (fixed "Execrcie"), correct content (fiscal year)
st.append(Paragraph('<u>Art.-15.- Exercice Social :</u>', ART))
st.append(Paragraph(
    'L\'exercice social débute le 1er octobre de chaque année pour être clos le 30 septembre de '
    'chaque année. Toutefois, le premier exercice ne débutera qu\'à compter de la date '
    'd\'immatriculation de la société au registre du commerce et des sociétés.', BODY))

# ART 16 — BÉNÉFICES (properly placed here)
st.append(Paragraph('<u>Art.-16.- Répartition des Bénéfices :</u>', ART))
st.append(Paragraph(
    'Le bénéfice de l\'exercice écoulé est calculé par la différence entre les revenus et les '
    'charges de l\'exercice, après déduction des amortissements et provisions.', BODY))
items_16 = [
    'Ce bénéfice est réparti entre tous les associés proportionnellement au nombre de parts '
    'appartenant à chacun d\'eux.',
    'L\'assemblée générale peut toutefois décider d\'affecter les sommes distribuables aux '
    'réserves et au report à nouveau, en totalité ou en partie.',
]
for i, item in enumerate(items_16):
    st.append(Paragraph(f'{chr(97+i)}) {item}', BULLET))

# TITRE VI — NEW SECTION
st.append(sp(10))
st.append(Paragraph('TITRE VI – DISSOLUTION ET LIQUIDATION', SECTION))
st.append(hr()); st.append(sp(6))

st.append(Paragraph('<u>Art.-17.- Dissolution et Liquidation :</u>', ART))
st.append(Paragraph(
    'La société est dissoute par l\'effet d\'une cause de dissolution prévue par la loi. Elle '
    'peut également être dissoute en vertu d\'une décision des associés réunis en assemblée '
    'générale extraordinaire.', BODY))
items_17 = [
    'Dès sa dissolution, la société est mise en liquidation. Un ou plusieurs liquidateurs sont '
    'nommés lors de l\'assemblée générale prononçant la dissolution. Ils disposent des pouvoirs '
    'les plus étendus pour réaliser l\'actif, payer le passif et répartir le solde entre les associés.',
    'En fin de liquidation, les liquidateurs convoquent l\'assemblée générale pour statuer sur '
    'les comptes définitifs, donner quitus et décharge de leur mandat et constater la clôture '
    'des opérations de liquidation.',
]
for i, item in enumerate(items_17):
    st.append(Paragraph(f'{chr(97+i)}) {item}', BULLET))

st.append(PageBreak())

# DISPOSITIONS FINALES
st.append(Paragraph('DISPOSITIONS FINALES', SECTION))
st.append(hr()); st.append(sp(6))

st.append(Paragraph('<u>Art.-18.- Adoption des Statuts :</u>', ART))
st.append(Paragraph(
    'Les présents statuts ont été adoptés par les associés fondateurs qui déclarent les accepter '
    'dans toutes leurs dispositions.', BODY))
st.append(sp(20))
st.append(Paragraph('<b>Fait de bonne foi à Port-au-Prince, le 14 septembre 2026</b>', CENTER))
st.append(sp(40))

sig_data = [
    ['______________________________', '______________________________'],
    ['Jean Fedner François (35%)', 'Fabian Francois (5%)'],
    ['', ''],
    ['', ''],
    ['______________________________', '______________________________'],
    ['Noël Freguens (8%)', 'Judes Dorméus (8%)'],
    ['', ''],
    ['', ''],
    ['______________________________', '______________________________'],
    ['Ramilène Jean Jacques (8%)', 'Jean Sony François (8%)'],
]
t = Table(sig_data, colWidths=[8*cm, 8*cm])
t.setStyle(TableStyle([
    ('FONTNAME', (0,0),(-1,-1), 'Helvetica'),
    ('FONTNAME', (0,1),(-1,1), 'Helvetica-Bold'),
    ('FONTNAME', (0,5),(-1,5), 'Helvetica-Bold'),
    ('FONTNAME', (0,9),(-1,9), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0),(-1,-1), 10),
    ('ALIGN',    (0,0),(-1,-1), 'CENTER'),
    ('TOPPADDING',(0,0),(-1,-1), 4),
    ('BOTTOMPADDING',(0,0),(-1,-1), 4),
]))
st.append(t)
st.append(sp(20))
st.append(hr())
st.append(sp(4))
st.append(Paragraph(
    'Version corrigée — À soumettre au notaire pour validation avant dépôt au MCI et à la BRH.',
    NOTE))

doc.build(st)
print("Done:", OUTPUT)
