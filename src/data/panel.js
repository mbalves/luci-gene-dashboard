// Painel Nutrigenético Ciera - 303 SNPs em 55 seções
// Gerado automaticamente a partir do PDF do Painel Nutrigenético Ciera Genomics

'use strict';

const PANEL = [
  {
    id: 'obesidade',
    category: 'DCNT',
    title: 'Obesidade',
    description: 'Predisposição genética ao acúmulo de gordura corporal, impactando a regulação de fome/saciedade, metabolismo de gorduras e comportamento alimentar.',
    snps: [
    { rsid: 'rs17300539', gene: 'ADIPOQ', riskAllele: 'A' },
    { rsid: 'rs1042713', gene: 'ADRB2', riskAllele: 'A' },
    { rsid: 'rs1042714', gene: 'ADRB2', riskAllele: 'G' },
    { rsid: 'rs925946', gene: 'BDNF', riskAllele: 'T' },
    { rsid: 'rs7647305', gene: 'ETV5', riskAllele: 'C' },
    { rsid: 'rs9939609', gene: 'FTO', riskAllele: 'A' },
    { rsid: 'rs8050136', gene: 'FTO', riskAllele: 'A' },
    { rsid: 'rs5443', gene: 'GNB3', riskAllele: 'T' },
    { rsid: 'rs10938397', gene: 'GNPDA2', riskAllele: 'G' },
    { rsid: 'rs7799039', gene: 'LEP', riskAllele: 'A' },
    { rsid: 'rs1805094', gene: 'LEPR', riskAllele: 'G' },
    { rsid: 'rs2605100', gene: 'LYPLAL', riskAllele: 'C' },
    { rsid: 'rs17782313', gene: 'MC4R', riskAllele: 'C' },
    { rsid: 'rs12970134', gene: 'MC4R', riskAllele: 'A' },
    { rsid: 'rs6234', gene: 'PCSK1', riskAllele: 'G' },
    { rsid: 'rs894160', gene: 'PLIN', riskAllele: 'A' },
    { rsid: 'rs1801282', gene: 'PPARG', riskAllele: 'G' },
    { rsid: 'rs7498665', gene: 'SH2B1', riskAllele: 'G' },
    { rsid: 'rs1800592', gene: 'UCP1', riskAllele: 'T' },
    { rsid: 'rs659366', gene: 'UCP2', riskAllele: 'T' }
    ],
  },
  {
    id: 'preferencias',
    category: 'DCNT',
    title: 'Preferências Alimentares e Hábito de Beliscar',
    description: 'Influência genética na regulação da saciedade, preferência por alimentos doces/amargos e hábito de beliscar.',
    snps: [
    { rsid: 'rs925946', gene: 'BDNF', riskAllele: 'T' },
    { rsid: 'rs9939609', gene: 'FTO', riskAllele: 'A' },
    { rsid: 'rs8050136', gene: 'FTO', riskAllele: 'A' },
    { rsid: 'rs490683', gene: 'GHSR', riskAllele: 'G' },
    { rsid: 'rs7799039', gene: 'LEP', riskAllele: 'A' },
    { rsid: 'rs1805094', gene: 'LEPR', riskAllele: 'G' },
    { rsid: 'rs17782313', gene: 'MC4R', riskAllele: 'C' },
    { rsid: 'rs12970134', gene: 'MC4R', riskAllele: 'A' },
    { rsid: 'rs5400', gene: 'SLC2A2', riskAllele: 'A' },
    { rsid: 'rs35744813', gene: 'TAS1R3', riskAllele: 'C' },
    { rsid: 'rs1726866', gene: 'TAS2R38', riskAllele: 'A' },
    { rsid: 'rs10246939', gene: 'TAS2R38', riskAllele: 'T' }
    ],
  },
  {
    id: 'diabetes2',
    category: 'DCNT',
    title: 'Diabetes tipo 2',
    description: 'Variantes genéticas que influenciam a produção de insulina, resistência à insulina e homeostase da glicose.',
    snps: [
    { rsid: 'rs17300539', gene: 'ADIPOQ', riskAllele: 'A' },
    { rsid: 'rs1801260', gene: 'CLOCK', riskAllele: 'G' },
    { rsid: 'rs2287161', gene: 'CRY1', riskAllele: 'C' },
    { rsid: 'rs1044498', gene: 'ENPP1', riskAllele: 'G' },
    { rsid: 'rs1799883', gene: 'FABP2', riskAllele: 'T' },
    { rsid: 'rs9939609', gene: 'FTO', riskAllele: 'A' },
    { rsid: 'rs2287019', gene: 'GIPR', riskAllele: 'C' },
    { rsid: 'rs35767', gene: 'IGF1', riskAllele: 'G' },
    { rsid: 'rs4402960', gene: 'IGF2BP2', riskAllele: 'T' },
    { rsid: 'rs1801278', gene: 'INSR', riskAllele: 'A' },
    { rsid: 'rs2943641', gene: 'IRS1', riskAllele: 'C' },
    { rsid: 'rs5219', gene: 'KCNJ11', riskAllele: 'T' },
    { rsid: 'rs10830963', gene: 'MTNR1B', riskAllele: 'G' },
    { rsid: 'rs1801282', gene: 'PPARG', riskAllele: 'G' },
    { rsid: 'rs340874', gene: 'PROX1', riskAllele: 'C' },
    { rsid: 'rs7498665', gene: 'SH2B1', riskAllele: 'G' },
    { rsid: 'rs7896005', gene: 'SIRT1', riskAllele: 'G' },
    { rsid: 'rs622342', gene: 'SLC22A1', riskAllele: 'A' },
    { rsid: 'rs13266634', gene: 'SLC30A8', riskAllele: 'C' },
    { rsid: 'rs7903146', gene: 'TCF7L2', riskAllele: 'T' },
    { rsid: 'rs12255372', gene: 'TCF7L2', riskAllele: 'T' }
    ],
  },
  {
    id: 'esteatose',
    category: 'DCNT',
    title: 'Esteatose Hepática Não Alcoólica',
    description: 'Predisposição ao acúmulo de gordura no fígado, relacionada ao metabolismo de triglicerídeos e resposta inflamatória.',
    snps: [
    { rsid: 'rs780094', gene: 'GCKR', riskAllele: 'T' },
    { rsid: 'rs1260326', gene: 'GCKR', riskAllele: 'T' },
    { rsid: 'rs1801131', gene: 'MTHFR', riskAllele: 'G' },
    { rsid: 'rs1801133', gene: 'MTHFR', riskAllele: 'A' },
    { rsid: 'rs7946', gene: 'PEMT', riskAllele: 'T' },
    { rsid: 'rs738409', gene: 'PNPLA3', riskAllele: 'G' },
    { rsid: 'rs58542926', gene: 'TM6SF2', riskAllele: 'A' },
    { rsid: 'rs361525', gene: 'TNF-α', riskAllele: 'A' }
    ],
  },
  {
    id: 'cardiovascular',
    category: 'DCNT',
    title: 'Risco Cardiovascular',
    description: 'Propensão à formação de placas nas artérias, coagulação sanguínea, estresse oxidativo e inflamação cardiovascular.',
    snps: [
    { rsid: 'rs3825807', gene: 'ADAMTS7', riskAllele: 'A' },
    { rsid: 'rs1800790', gene: 'CDKN2A', riskAllele: 'A' },
    { rsid: 'rs10757278', gene: 'Leiden', riskAllele: 'G' },
    { rsid: 'rs6025', gene: 'ITGB3/HPA1', riskAllele: 'T' },
    { rsid: 'rs1800595', gene: 'LIPC', riskAllele: 'C' },
    { rsid: 'rs5985', gene: 'MTHFD1L', riskAllele: 'C' },
    { rsid: 'rs5918', gene: 'MTHFR', riskAllele: 'T' },
    { rsid: 'rs2070895', gene: 'MTHFR', riskAllele: 'A' },
    { rsid: 'rs6922269', gene: 'NINJ2', riskAllele: 'A' },
    { rsid: 'rs1801133', gene: 'MTHFR', riskAllele: 'A' },
    { rsid: 'rs1801131', gene: 'MTHFR', riskAllele: 'G' },
    { rsid: 'rs12425791', gene: 'NINJ2', riskAllele: 'A' },
    { rsid: 'rs1799963', gene: 'F2', riskAllele: 'A' },
    { rsid: 'rs3184504', gene: 'SH2B3', riskAllele: 'T' },
    { rsid: 'rs7896005', gene: 'SIRT1', riskAllele: 'G' },
    { rsid: 'rs7069102', gene: 'SIRT1', riskAllele: 'C' },
    { rsid: 'rs2010963', gene: 'VEGFA', riskAllele: 'C' },
    { rsid: 'rs6725887', gene: 'WDR12', riskAllele: 'C' }
    ],
  },
  {
    id: 'hipertensao',
    category: 'DCNT',
    title: 'Hipertensão Arterial',
    description: 'Variantes no sistema renina-angiotensina-aldosterona e resposta vascular que contribuem para pressão arterial elevada.',
    snps: [
    { rsid: 'rs699', gene: 'AGT', riskAllele: 'C' },
    { rsid: 'rs5186', gene: 'AGTR1', riskAllele: 'C' },
    { rsid: 'rs2681492', gene: 'ATP2B1', riskAllele: 'T' },
    { rsid: 'rs4343', gene: 'ECA', riskAllele: 'G' },
    { rsid: 'rs5370', gene: 'EDN', riskAllele: 'T' },
    { rsid: 'rs1799983', gene: 'ENOS', riskAllele: 'T' },
    { rsid: 'rs1024323', gene: 'GRK4', riskAllele: 'T' },
    { rsid: 'rs2960306', gene: 'GRK4', riskAllele: 'T' }
    ],
  },
  {
    id: 'colesterol_total',
    category: 'DCNT',
    title: 'Colesterol Total',
    description: 'Predisposição genética a níveis elevados de colesterol total, influenciada por fatores de síntese, transporte e captação.',
    snps: [
    { rsid: 'rs6756629', gene: 'ABCG5', riskAllele: 'G' },
    { rsid: 'rs4299376', gene: 'ABCG8', riskAllele: 'G' },
    { rsid: 'rs662799', gene: 'APOA5', riskAllele: 'G' },
    { rsid: 'rs693', gene: 'APOB', riskAllele: 'A' },
    { rsid: 'rs5742904', gene: 'APOB', riskAllele: 'T' },
    { rsid: 'rs515135', gene: 'APOB', riskAllele: 'T' },
    { rsid: 'rs5128', gene: 'APOC3', riskAllele: 'G' },
    { rsid: 'rs1799883', gene: 'TG', riskAllele: 'T' },
    { rsid: 'rs3846662', gene: 'FABP2', riskAllele: 'G' },
    { rsid: 'rs6511720', gene: 'HMGCR', riskAllele: 'G' },
    { rsid: 'rs688', gene: 'LDLR', riskAllele: 'T' },
    { rsid: 'rs964184', gene: 'LDLR', riskAllele: 'C' }
    ],
  },
  {
    id: 'ldl',
    category: 'DCNT',
    title: 'Risco de Colesterol LDL Elevado',
    description: 'Risco genético para colesterol LDL elevado ("colesterol ruim"), envolvendo genes de produção, transporte e captação do LDL.',
    snps: [
    { rsid: 'rs6756629', gene: 'ABCG5', riskAllele: 'G' },
    { rsid: 'rs4299376', gene: 'ABCG8', riskAllele: 'G' },
    { rsid: 'rs675', gene: 'APOA4', riskAllele: 'A' },
    { rsid: 'rs693', gene: 'APOB', riskAllele: 'A' },
    { rsid: 'rs5742904', gene: 'APOB', riskAllele: 'T' },
    { rsid: 'rs515135', gene: 'APOB', riskAllele: 'T' },
    { rsid: 'rs12740374', gene: 'CELSR2', riskAllele: 'T' },
    { rsid: 'rs6511720', gene: 'LDLR', riskAllele: 'G' },
    { rsid: 'rs688', gene: 'LDLR', riskAllele: 'T' },
    { rsid: 'rs11206510', gene: 'PCSK9', riskAllele: 'T' },
    { rsid: 'rs11591147', gene: 'PCSK9', riskAllele: 'G' },
    { rsid: 'rs505151', gene: 'PCSK9', riskAllele: 'G' },
    { rsid: 'rs599839', gene: 'PSRC1', riskAllele: 'A' },
    { rsid: 'rs964184', gene: 'ZPR1', riskAllele: 'C' }
    ],
  },
  {
    id: 'hdl',
    category: 'DCNT',
    title: 'Risco de Colesterol HDL Reduzido',
    description: 'Predisposição genética a colesterol HDL reduzido ("colesterol bom"), afetando síntese, transporte e remoção do HDL.',
    snps: [
    { rsid: 'rs1799837', gene: 'APOA1', riskAllele: 'C' },
    { rsid: 'rs675', gene: 'APOA4', riskAllele: 'A' },
    { rsid: 'rs708272', gene: 'CETP', riskAllele: 'G' },
    { rsid: 'rs1800588', gene: 'LIPC', riskAllele: 'C' },
    { rsid: 'rs4939883', gene: 'LIPG', riskAllele: 'T' },
    { rsid: 'rs13702', gene: 'LPL', riskAllele: 'T' },
    { rsid: 'rs1256335', gene: 'LPL', riskAllele: 'G' },
    { rsid: 'rs505151', gene: 'PCSK9', riskAllele: 'G' },
    { rsid: 'rs854560', gene: 'PON1', riskAllele: 'A' },
    { rsid: 'rs964184', gene: 'ZPR1', riskAllele: 'C' }
    ],
  },
  {
    id: 'triglicerideos',
    category: 'DCNT',
    title: 'Hipertrigliceridemia',
    description: 'Variantes genéticas que afetam o metabolismo e armazenamento de triglicerídeos no sangue.',
    snps: [
    { rsid: 'rs662799', gene: 'APOA5', riskAllele: 'G' },
    { rsid: 'rs5128', gene: 'APOC3', riskAllele: 'G' },
    { rsid: 'rs13702', gene: 'TG', riskAllele: 'T' },
    { rsid: 'rs505151', gene: 'LPL', riskAllele: 'G' },
    { rsid: 'rs964184', gene: 'PCSK9', riskAllele: 'C' }
    ],
  },
  {
    id: 'apoe',
    category: 'DCNT',
    title: 'APOE',
    description: 'Variantes do gene APOE que influenciam o metabolismo lipídico e risco cardiovascular e neurodegenerativo.',
    snps: [
    { rsid: 'rs429358', gene: 'APOE', riskAllele: 'C' },
    { rsid: 'rs7412', gene: 'APOE', riskAllele: 'T' }
    ],
  },
  {
    id: 'diabetes1',
    category: 'Diabetes tipo 1',
    title: 'Diabetes tipo 1',
    description: 'Predisposição autoimune ao Diabetes tipo 1, envolvendo genes de regulação imunológica e produção de insulina.',
    snps: [
    { rsid: 'rs12708716', gene: 'CLEC16A', riskAllele: 'A' },
    { rsid: 'rs2069763', gene: 'IL2', riskAllele: 'A' },
    { rsid: 'rs3741208', gene: 'INS', riskAllele: 'A' }
    ],
  },
  {
    id: 'alcool',
    category: 'Intolerâncias',
    title: 'Metabolismo de Álcool',
    description: 'Capacidade enzimática de metabolizar o acetaldeído, subproduto tóxico do metabolismo do álcool.',
    snps: [
    { rsid: 'rs671', gene: 'ALDH2', riskAllele: 'A' }
    ],
  },
  {
    id: 'cafeina',
    category: 'Intolerâncias',
    title: 'Cafeína',
    description: 'Velocidade de metabolização da cafeína e sensibilidade ao sistema adenosinérgico.',
    snps: [
    { rsid: 'rs5751876', gene: 'ADORA2A', riskAllele: 'T' },
    { rsid: 'rs762551', gene: 'CYP1A2', riskAllele: 'C' }
    ],
  },
  {
    id: 'lactose',
    category: 'Intolerâncias',
    title: 'Intolerância à Lactose',
    description: 'Persistência ou não da atividade da lactase na fase adulta, determinando a tolerância ao leite e derivados.',
    snps: [
    { rsid: 'rs4988235', gene: 'MCM6', riskAllele: 'G' }
    ],
  },
  {
    id: 'gluten',
    category: 'Intolerâncias',
    title: 'Intolerância ao Glúten e Doença Celíaca',
    description: 'Predisposição imunológica à doença celíaca e intolerância ao glúten, associada a variantes do sistema HLA.',
    snps: [
    { rsid: 'rs2187668', gene: 'HLA', riskAllele: 'T' },
    { rsid: 'rs2395182', gene: 'HLA', riskAllele: 'T' },
    { rsid: 'rs7775228', gene: 'HLA', riskAllele: 'G' },
    { rsid: 'rs4639334', gene: 'HLA', riskAllele: 'A' },
    { rsid: 'rs7454108', gene: 'HLA', riskAllele: 'C' },
    { rsid: 'rs4713586', gene: 'HLA', riskAllele: 'G' }
    ],
  },
  {
    id: 'histamina',
    category: 'Intolerâncias',
    title: 'Intolerância a Histamina',
    description: 'Capacidade das enzimas DAO e HNMT de metabolizar histamina, influenciando sintomas de intolerância.',
    snps: [
    { rsid: 'rs10156191', gene: 'DAO', riskAllele: 'T' },
    { rsid: 'rs1049742', gene: 'DAO', riskAllele: 'T' },
    { rsid: 'rs2268999', gene: 'DAO', riskAllele: 'T' },
    { rsid: 'rs2052129', gene: 'DAO', riskAllele: 'T' },
    { rsid: 'rs1049793', gene: 'DAO', riskAllele: 'C' },
    { rsid: 'rs11558538', gene: 'HNMT', riskAllele: 'T' },
    { rsid: 'rs12995000', gene: 'HNMT', riskAllele: 'T' },
    { rsid: 'rs1050891', gene: 'HNMT', riskAllele: 'G' }
    ],
  },
  {
    id: 'niquel',
    category: 'Intolerâncias',
    title: 'Sensibilidade ao Níquel',
    description: 'Integridade da barreira intestinal e resposta imune ao níquel, determinando sensibilidade ao metal.',
    snps: [
    { rsid: 'rs893051', gene: 'CLDN1', riskAllele: 'C' },
    { rsid: 'rs17501010', gene: 'CLDN1', riskAllele: 'G' },
    { rsid: 'rs9290927', gene: 'CLDN1', riskAllele: 'T' },
    { rsid: 'rs61816761', gene: 'FLG', riskAllele: 'A' },
    { rsid: 'rs1800629', gene: 'TNF-alfa', riskAllele: 'A' }
    ],
  },
  {
    id: 'omega3',
    category: 'Vitaminas e Minerais',
    title: 'Metabolismo de Ômega-3',
    description: 'Capacidade de converter ácidos graxos ômega-3 em formas ativas e incorporação nas membranas celulares.',
    snps: [
    { rsid: 'rs429358', gene: 'APOE', riskAllele: 'A' },
    { rsid: 'rs7412', gene: 'APOE', riskAllele: 'A' },
    { rsid: 'rs1527483', gene: 'ELOVL2', riskAllele: 'T' },
    { rsid: 'rs953413', gene: 'FADS1', riskAllele: 'T' },
    { rsid: 'rs1799983', gene: 'NOS3', riskAllele: 'A' },
    { rsid: 'rs174546', gene: 'FADS1', riskAllele: 'G' },
    { rsid: 'rs174616', gene: 'FADS1', riskAllele: 'G' },
    { rsid: 'rs174537', gene: 'FADS1', riskAllele: 'G' },
    { rsid: 'rs1801282', gene: 'PPARG', riskAllele: 'G' }
    ],
  },
  {
    id: 'vitA',
    category: 'Vitaminas e Minerais',
    title: 'Vitamina A',
    description: 'Eficiência na conversão de betacaroteno em vitamina A ativa (retinol) pelo organismo.',
    snps: [
    { rsid: 'rs7501331', gene: 'BCMO1', riskAllele: 'T' },
    { rsid: 'rs12934922', gene: 'BCMO1', riskAllele: 'T' },
    { rsid: 'rs11645428', gene: 'BCMO1', riskAllele: 'G' },
    { rsid: 'rs6420424', gene: 'BCMO1', riskAllele: 'A' }
    ],
  },
  {
    id: 'vitD',
    category: 'Vitaminas e Minerais',
    title: 'Vitamina D',
    description: 'Síntese, ativação biológica e função dos receptores de vitamina D no organismo.',
    snps: [
    { rsid: 'rs10877012', gene: 'CYP27B1', riskAllele: 'G' },
    { rsid: 'rs12785878', gene: 'DHCR7', riskAllele: 'T' },
    { rsid: 'rs2282679', gene: 'GC', riskAllele: 'G' },
    { rsid: 'rs7975232', gene: 'VDR', riskAllele: 'A' },
    { rsid: 'rs1544410', gene: 'VDR', riskAllele: 'T' },
    { rsid: 'rs2228570', gene: 'VDR', riskAllele: 'A' },
    { rsid: 'rs731236', gene: 'VDR', riskAllele: 'G' }
    ],
  },
  {
    id: 'vitB6',
    category: 'Vitaminas e Minerais',
    title: 'Vitamina B6',
    description: 'Metabolismo da vitamina B6, essencial para síntese de neurotransmissores e metabolismo de aminoácidos.',
    snps: [
    { rsid: 'rs1697421', gene: 'ALPL', riskAllele: 'T' },
    { rsid: 'rs4654748', gene: 'NBPF3', riskAllele: 'C' }
    ],
  },
  {
    id: 'colina',
    category: 'Vitaminas e Minerais',
    title: 'Colina',
    description: 'Produção e metabolismo da colina, nutriente essencial para membranas celulares, função hepática e saúde cerebral.',
    snps: [
    { rsid: 'rs9001', gene: 'CHDH', riskAllele: 'T' },
    { rsid: 'rs12676', gene: 'CHDH', riskAllele: 'A' },
    { rsid: 'rs10791957', gene: 'CHKA', riskAllele: 'A' },
    { rsid: 'rs1557502', gene: 'CHKB', riskAllele: 'T' },
    { rsid: 'rs7946', gene: 'PEMT', riskAllele: 'T' },
    { rsid: 'rs3199966', gene: 'SLC44A1', riskAllele: 'T' }
    ],
  },
  {
    id: 'folato',
    category: 'Vitaminas e Minerais',
    title: 'Ácido Fólico / Risco de Hiperhomocisteinemia',
    description: 'Ciclo do folato e risco de hiperhomocisteinemia, envolvendo enzimas do metabolismo do ácido fólico.',
    snps: [
    { rsid: 'rs3733890', gene: 'BHMT', riskAllele: 'A' },
    { rsid: 'rs234706', gene: 'CBS', riskAllele: 'G' },
    { rsid: 'rs61886492', gene: 'FPGS', riskAllele: 'A' },
    { rsid: 'rs6922269', gene: 'MTHFD1L', riskAllele: 'A' },
    { rsid: 'rs1801131', gene: 'MTHFR', riskAllele: 'G' },
    { rsid: 'rs1801133', gene: 'MTHFR', riskAllele: 'A' },
    { rsid: 'rs1805087', gene: 'MTR', riskAllele: 'A' },
    { rsid: 'rs1801394', gene: 'MTRR', riskAllele: 'G' },
    { rsid: 'rs1051266', gene: 'SLC19A1', riskAllele: 'T' }
    ],
  },
  {
    id: 'vitB12',
    category: 'Vitaminas e Minerais',
    title: 'Vitamina B12',
    description: 'Absorção intestinal e transporte da vitamina B12, essencial para função neurológica e hematopoiese.',
    snps: [
    { rsid: 'rs602662', gene: 'FUT2', riskAllele: 'G' },
    { rsid: 'rs601338', gene: 'FUT2', riskAllele: 'G' },
    { rsid: 'rs9606756', gene: 'TCN2', riskAllele: 'G' },
    { rsid: 'rs1801198', gene: 'TCN2', riskAllele: 'G' }
    ],
  },
  {
    id: 'vitC',
    category: 'Vitaminas e Minerais',
    title: 'Vitamina C',
    description: 'Transporte e absorção de vitamina C, importante antioxidante e cofator enzimático.',
    snps: [
    { rsid: 'rs33972313', gene: 'SLC23A1', riskAllele: 'T' }
    ],
  },
  {
    id: 'vitE',
    category: 'Vitaminas e Minerais',
    title: 'Vitamina E',
    description: 'Transporte e metabolismo da vitamina E, principal antioxidante lipossolúvel do organismo.',
    snps: [
    { rsid: 'rs12272004', gene: 'IM11', riskAllele: 'C' }
    ],
  },
  {
    id: 'minerais',
    category: 'Vitaminas e Minerais',
    title: 'Minerais',
    description: 'Absorção, transporte e metabolismo de minerais como ferro, cálcio, zinco, cobre e selênio.',
    snps: [
    { rsid: 'rs1532423', gene: 'CA1', riskAllele: 'A' },
    { rsid: 'rs17251221', gene: 'CaSR', riskAllele: 'G' },
    { rsid: 'rs6776158', gene: 'CaSR', riskAllele: 'G' },
    { rsid: 'rs7652589', gene: 'CaSR', riskAllele: 'A' },
    { rsid: 'rs1501899', gene: 'CaSR', riskAllele: 'A' },
    { rsid: 'rs921943', gene: 'DMGDH', riskAllele: 'T' },
    { rsid: 'rs1799945', gene: 'HFE', riskAllele: 'G' },
    { rsid: 'rs1800562', gene: 'HFE', riskAllele: 'A' },
    { rsid: 'rs4826508', gene: 'NBDY', riskAllele: 'T' },
    { rsid: 'rs2120019', gene: 'PPCDC', riskAllele: 'C' },
    { rsid: 'rs1049296', gene: 'TF', riskAllele: 'T' },
    { rsid: 'rs3811647', gene: 'TF', riskAllele: 'A' },
    { rsid: 'rs4820268', gene: 'TMPRSS6', riskAllele: 'A' },
    { rsid: 'rs3817672', gene: 'TRF', riskAllele: 'T' },
    { rsid: 'rs11144134', gene: 'TRPM6', riskAllele: 'T' }
    ],
  },
  {
    id: 'longevidade',
    category: 'Longevidade',
    title: 'Longevidade e Biogênese Mitocondrial',
    description: 'Genes associados à longevidade celular, função mitocondrial, proteção de telômeros e atividade antioxidante.',
    snps: [
    { rsid: 'rs429358', gene: 'APOE', riskAllele: 'G' },
    { rsid: 'rs7412', gene: 'APOE', riskAllele: 'A' },
    { rsid: 'rs73885319', gene: 'CLU', riskAllele: 'T' },
    { rsid: 'rs5882', gene: 'CETP', riskAllele: 'T' },
    { rsid: 'rs2802292', gene: 'FOXO3', riskAllele: 'G' },
    { rsid: 'rs2764264', gene: 'FOXO3A', riskAllele: 'A' },
    { rsid: 'rs34516635', gene: 'NME7', riskAllele: 'T' },
    { rsid: 'rs9652490', gene: 'TELO2', riskAllele: 'T' },
    { rsid: 'rs1799836', gene: 'MAOB', riskAllele: 'T' },
    { rsid: 'rs6721961', gene: 'NRF2', riskAllele: 'T' },
    { rsid: 'rs8192678', gene: 'PPARGC1A', riskAllele: 'A' },
    { rsid: 'rs2016520', gene: 'PPARD', riskAllele: 'C' },
    { rsid: 'rs755017', gene: 'TOMM40', riskAllele: 'T' },
    { rsid: 'rs11555236', gene: 'TIMELESS', riskAllele: 'T' },
    { rsid: 'rs107251', gene: 'SIRT6', riskAllele: 'T' },
    { rsid: 'rs2242652', gene: 'TERT', riskAllele: 'G' },
    { rsid: 'rs2075650', gene: 'TOMM40', riskAllele: 'G' },
    { rsid: 'rs1800592', gene: 'UCP1', riskAllele: 'T' },
    { rsid: 'rs659366', gene: 'UCP2', riskAllele: 'T' },
    { rsid: 'rs12608932', gene: 'SOD2', riskAllele: 'C' },
    { rsid: 'rs25487', gene: 'XRCC1', riskAllele: 'C' }
    ],
  },
  {
    id: 'destox',
    category: 'Destoxificação',
    title: 'Destoxificação',
    description: 'Enzimas de fase I e II envolvidas na neutralização e eliminação de toxinas, xenobióticos e radicais livres.',
    snps: [
    { rsid: 'rs1001179', gene: 'CAT', riskAllele: 'G' },
    { rsid: 'rs1051740', gene: 'EPHX1', riskAllele: 'T' },
    { rsid: 'rs2234922', gene: 'EPHX1', riskAllele: 'A' },
    { rsid: 'rs1050450', gene: 'GPX1', riskAllele: 'T' },
    { rsid: 'rs2071487', gene: 'GSTM1', riskAllele: 'A' },
    { rsid: 'rs74837985', gene: 'GSTM1', riskAllele: 'T' },
    { rsid: 'rs1695', gene: 'GSTP1', riskAllele: 'A' },
    { rsid: 'rs1138272', gene: 'GSTP1', riskAllele: 'C' },
    { rsid: 'rs1495741', gene: 'NAT2', riskAllele: 'A' },
    { rsid: 'rs1131341', gene: 'NQO1', riskAllele: 'C' },
    { rsid: 'rs1800566', gene: 'NQO1', riskAllele: 'T' },
    { rsid: 'rs6721961', gene: 'NRF2', riskAllele: 'T' },
    { rsid: 'rs4880', gene: 'SOD2', riskAllele: 'T' },
    { rsid: 'rs1799895', gene: 'SOD3', riskAllele: 'C' },
    { rsid: 'rs8192288', gene: 'SOD3', riskAllele: 'T' },
    { rsid: 'rs773115', gene: 'SUOX', riskAllele: 'C' }
    ],
  },
  {
    id: 'inflamacao',
    category: 'Resposta Inflamatória',
    title: 'Resposta Inflamatória',
    description: 'Variantes em citocinas e mediadores inflamatórios que determinam a intensidade da resposta inflamatória.',
    snps: [
    { rsid: 'rs1143643', gene: 'IL1B', riskAllele: 'T' },
    { rsid: 'rs2082412', gene: 'IL12B', riskAllele: 'G' },
    { rsid: 'rs2201841', gene: 'IL23R', riskAllele: 'G' },
    { rsid: 'rs1800795', gene: 'IL6', riskAllele: 'G' },
    { rsid: 'rs2228145', gene: 'IL6R', riskAllele: 'C' },
    { rsid: 'rs361525', gene: 'TNF-alfa', riskAllele: 'A' },
    { rsid: 'rs1800629', gene: 'TNF-alfa', riskAllele: 'A' }
    ],
  },
  {
    id: 'macular',
    category: 'Degeneração Macular',
    title: 'Degeneração Macular',
    description: 'Predisposição genética à degeneração macular relacionada à idade (AMD), principal causa de cegueira.',
    snps: [
    { rsid: 'rs10490924', gene: 'ARMS2', riskAllele: 'T' },
    { rsid: 'rs1061170', gene: 'CFH', riskAllele: 'T' },
    { rsid: 'rs11200638', gene: 'HTRA1', riskAllele: 'A' },
    { rsid: 'rs361525', gene: 'TNF-α', riskAllele: 'A' },
    { rsid: 'rs1800629', gene: 'TNF-α', riskAllele: 'A' }
    ],
  },
  {
    id: 'dii',
    category: 'Doença Inflamatória Intestinal',
    title: 'Doença Inflamatória Intestinal',
    description: 'Variantes que aumentam o risco de doença de Crohn e retocolite ulcerativa, doenças inflamatórias intestinais.',
    snps: [
    { rsid: 'rs602662', gene: 'FUT2', riskAllele: 'G' },
    { rsid: 'rs1143643', gene: 'IL1B', riskAllele: 'T' },
    { rsid: 'rs1143634', gene: 'IL1B', riskAllele: 'A' },
    { rsid: 'rs2082412', gene: 'IL12B', riskAllele: 'G' },
    { rsid: 'rs2201841', gene: 'IL23R', riskAllele: 'G' },
    { rsid: 'rs1800795', gene: 'IL6', riskAllele: 'G' },
    { rsid: 'rs2066845', gene: 'NOD2', riskAllele: 'C' },
    { rsid: 'rs744166', gene: 'STAT3', riskAllele: 'A' },
    { rsid: 'rs361525', gene: 'TNF-α', riskAllele: 'A' },
    { rsid: 'rs1800629', gene: 'TNF-α', riskAllele: 'A' }
    ],
  },
  {
    id: 'circadiano',
    category: 'Ciclo Circadiano',
    title: 'Ciclo Circadiano',
    description: 'Regulação do relógio biológico interno, padrões de sono e sincronização com ciclos luz/escuridão.',
    snps: [
    { rsid: 'rs1801260', gene: 'CLOCK', riskAllele: 'G' },
    { rsid: 'rs2287161', gene: 'CRY1', riskAllele: 'C' },
    { rsid: 'rs11605924', gene: 'CRY2', riskAllele: 'C' },
    { rsid: 'rs7123390', gene: 'CRY2', riskAllele: 'A' },
    { rsid: 'rs12506228', gene: 'MTNR1A', riskAllele: 'A' },
    { rsid: 'rs10830963', gene: 'MTNR1B', riskAllele: 'G' },
    { rsid: 'rs4663302', gene: 'PER2', riskAllele: 'T' },
    { rsid: 'rs934945', gene: 'PER2', riskAllele: 'C' },
    { rsid: 'rs228697', gene: 'PER3', riskAllele: 'G' }
    ],
  },
  {
    id: 'estresse',
    category: 'Saúde Mental',
    title: 'Resposta ao Estresse',
    description: 'Resposta neurobiológica ao estresse, regulação de neurotransmissores e adaptação às adversidades.',
    snps: [
    { rsid: 'rs6265', gene: 'BDNF', riskAllele: 'T' },
    { rsid: 'rs1049353', gene: 'CNR1', riskAllele: 'T' },
    { rsid: 'rs4680', gene: 'COMT', riskAllele: 'A' },
    { rsid: 'rs4633', gene: 'COMT', riskAllele: 'T' },
    { rsid: 'rs11206244', gene: 'DIO1', riskAllele: 'T' },
    { rsid: 'rs225014', gene: 'DIO2', riskAllele: 'C' },
    { rsid: 'rs12885300', gene: 'DIO2', riskAllele: 'C' },
    { rsid: 'rs769407', gene: 'GAD1', riskAllele: 'C' },
    { rsid: 'rs6311', gene: 'HTR2A', riskAllele: 'C' },
    { rsid: 'rs6314', gene: 'HTR2A', riskAllele: 'A' },
    { rsid: 'rs16944', gene: 'IL1B', riskAllele: 'G' },
    { rsid: 'rs1137070', gene: 'MAOA', riskAllele: 'T' },
    { rsid: 'rs1799836', gene: 'MAOB', riskAllele: 'T' },
    { rsid: 'rs6330', gene: 'NGF', riskAllele: 'A' },
    { rsid: 'rs2254298', gene: 'OXR', riskAllele: 'A' },
    { rsid: 'rs3758391', gene: 'SIRT1', riskAllele: 'T' }
    ],
  },
  {
    id: 'dependencia',
    category: 'Saúde Mental',
    title: 'Comportamento de Dependência',
    description: 'Predisposição neurobiológica a comportamentos de dependência via sistema dopaminérgico e endocanabinoide.',
    snps: [
    { rsid: 'rs806380', gene: 'CNR1', riskAllele: 'A' },
    { rsid: 'rs806368', gene: 'CNR1', riskAllele: 'C' },
    { rsid: 'rs686', gene: 'DRD1', riskAllele: 'A' },
    { rsid: 'rs1076560', gene: 'DRD2', riskAllele: 'A' },
    { rsid: 'rs1800497', gene: 'DRD2', riskAllele: 'A' },
    { rsid: 'rs1799971', gene: 'OPRM1', riskAllele: 'G' }
    ],
  },
  {
    id: 'enxaqueca',
    category: 'Saúde Mental',
    title: 'Enxaqueca',
    description: 'Variantes em receptores de glutamato e canais iônicos associados à susceptibilidade à enxaqueca.',
    snps: [
    { rsid: 'rs2195450', gene: 'GRIA1', riskAllele: 'A' },
    { rsid: 'rs3761555', gene: 'GRIA3', riskAllele: 'T' },
    { rsid: 'rs8065080', gene: 'TRPV1', riskAllele: 'C' }
    ],
  },
  {
    id: 'dor',
    category: 'Saúde Mental',
    title: 'Sensibilidade a Dor',
    description: 'Modulação genética da percepção da dor via receptores opioides e canais de dor (TRPV1).',
    snps: [
    { rsid: 'rs4680', gene: 'COMT', riskAllele: 'A' },
    { rsid: 'rs1799971', gene: 'OPRM1', riskAllele: 'G' },
    { rsid: 'rs8065080', gene: 'TRPV1', riskAllele: 'C' }
    ],
  },
  {
    id: 'estrogeno',
    category: 'Saúde Hormonal',
    title: 'Receptores de Estrógeno',
    description: 'Receptores alfa e beta de estrógeno que medeiam os efeitos desse hormônio nos tecidos.',
    snps: [
    { rsid: 'rs1056836', gene: 'CYP1B1', riskAllele: 'G' },
    { rsid: 'rs2987983', gene: 'ERB', riskAllele: 'G' },
    { rsid: 'rs1271572', gene: 'ERB', riskAllele: 'A' },
    { rsid: 'rs4986938', gene: 'ERB', riskAllele: 'T' },
    { rsid: 'rs2234693', gene: 'ESR1', riskAllele: 'C' },
    { rsid: 'rs9340799', gene: 'ESR1', riskAllele: 'G' },
    { rsid: 'rs2228480', gene: 'ESR1', riskAllele: 'A' }
    ],
  },
  {
    id: 'tireoide',
    category: 'Saúde Hormonal',
    title: 'Função Tireoidiana',
    description: 'Conversão de T4 em T3 ativo pelas enzimas deiodinases, regulando o metabolismo tireoidiano.',
    snps: [
    { rsid: 'rs11206244', gene: 'DIO1', riskAllele: 'T' },
    { rsid: 'rs2235544', gene: 'DIO1', riskAllele: 'C' },
    { rsid: 'rs225014', gene: 'DIO2', riskAllele: 'C' },
    { rsid: 'rs12885300', gene: 'DIO2', riskAllele: 'C' }
    ],
  },
  {
    id: 'endometriose',
    category: 'Saúde da Mulher',
    title: 'Endometriose',
    description: 'Predisposição genética à endometriose, envolvendo metabolismo de estrógeno e resposta inflamatória.',
    snps: [
    { rsid: 'rs1048943', gene: 'CYP1A1', riskAllele: 'C' },
    { rsid: 'rs2987983', gene: 'ERB', riskAllele: 'G' },
    { rsid: 'rs9340799', gene: 'ESR1', riskAllele: 'G' },
    { rsid: 'rs1250248', gene: 'FN1', riskAllele: 'A' },
    { rsid: 'rs11674184', gene: 'WNT4', riskAllele: 'G' },
    { rsid: 'rs7521902', gene: 'WNT4', riskAllele: 'A' }
    ],
  },
  {
    id: 'menopausa',
    category: 'Saúde da Mulher',
    title: 'Menopausa Precoce',
    description: 'Variantes associadas à depleção precoce de folículos ovarianos e antecipação da menopausa.',
    snps: [
    { rsid: 'rs16991615', gene: 'MCM8', riskAllele: 'G' }
    ],
  },
  {
    id: 'diabetes_gest',
    category: 'Saúde da Mulher',
    title: 'Risco de Diabetes Mellitus Gestacional',
    description: 'Risco de desenvolvimento de diabetes durante a gravidez, afetando produção e sensibilidade à insulina.',
    snps: [
    { rsid: 'rs1042713', gene: 'ADRB2', riskAllele: 'A' },
    { rsid: 'rs9939609', gene: 'FTO', riskAllele: 'A' },
    { rsid: 'rs1801278', gene: 'INSR', riskAllele: 'A' },
    { rsid: 'rs5219', gene: 'KCNJ11', riskAllele: 'T' },
    { rsid: 'rs10830963', gene: 'MTNR1B', riskAllele: 'G' },
    { rsid: 'rs736118', gene: 'STRA6', riskAllele: 'C' },
    { rsid: 'rs7903146', gene: 'TCF7L2', riskAllele: 'T' },
    { rsid: 'rs12255372', gene: 'TCF7L2', riskAllele: 'T' },
    { rsid: 'rs1800629', gene: 'TNF-alfa', riskAllele: 'A' }
    ],
  },
  {
    id: 'preeclampsia',
    category: 'Saúde da Mulher',
    title: 'Risco de Pré-eclâmpsia',
    description: 'Predisposição à pré-eclâmpsia, condição hipertensiva grave da gestação com risco materno-fetal.',
    snps: [
    { rsid: 'rs4343', gene: 'ECA', riskAllele: 'G' },
    { rsid: 'rs1799983', gene: 'ENOS', riskAllele: 'T' },
    { rsid: 'rs1143634', gene: 'IL1B', riskAllele: 'A' }
    ],
  },
  {
    id: 'aptidao',
    category: 'Desempenho Esportivo',
    title: 'Aptidão Física',
    description: 'Capacidade física, composição muscular, resposta cardiovascular e aproveitamento do exercício.',
    snps: [
    { rsid: 'rs1815739', gene: 'ACTN3', riskAllele: 'T' },
    { rsid: 'rs699', gene: 'AGT', riskAllele: 'C' },
    { rsid: 'rs1799722', gene: 'BDKRB2', riskAllele: 'C' },
    { rsid: 'rs2070744', gene: 'ENOS', riskAllele: 'C' },
    { rsid: 'rs7181866', gene: 'GABPB1', riskAllele: 'G' },
    { rsid: 'rs1799945', gene: 'HFE', riskAllele: 'G' },
    { rsid: 'rs1805086', gene: 'MSTN', riskAllele: 'T' },
    { rsid: 'rs1572312', gene: 'NFIA-AS2', riskAllele: 'T' },
    { rsid: 'rs4253778', gene: 'Eritropoiese', riskAllele: 'C' }
    ],
  },
  {
    id: 'energia',
    category: 'Desempenho Esportivo',
    title: 'Produção de Energia no Exercício Físico',
    description: 'Metabolismo energético no exercício, utilização de substratos (gordura vs. glicose) e eficiência mitocondrial.',
    snps: [
    { rsid: 'rs4994', gene: 'ADRB3', riskAllele: 'G' },
    { rsid: 'rs1801260', gene: 'CLOCK', riskAllele: 'G' },
    { rsid: 'rs762551', gene: 'CYP1A2', riskAllele: 'C' },
    { rsid: 'rs7799039', gene: 'LEP', riskAllele: 'A' },
    { rsid: 'rs1805094', gene: 'LEPR', riskAllele: 'G' },
    { rsid: 'rs8192678', gene: 'PGC1-alfa', riskAllele: 'T' },
    { rsid: 'rs4253778', gene: 'PPAR-Alfa', riskAllele: 'C' },
    { rsid: 'rs2016520', gene: 'PPARD', riskAllele: 'T' },
    { rsid: 'rs2267668', gene: 'PPARD', riskAllele: 'A' },
    { rsid: 'rs1801282', gene: 'PPARG', riskAllele: 'G' }
    ],
  },
  {
    id: 'fadiga',
    category: 'Desempenho Esportivo',
    title: 'Fadiga Precoce e Lesões Musculares',
    description: 'Predisposição à fadiga muscular precoce, lesões em tecido conjuntivo e recuperação pós-exercício.',
    snps: [
    { rsid: 'rs17602729', gene: 'AMPD1', riskAllele: 'C' },
    { rsid: 'rs1800012', gene: 'COL1A1', riskAllele: 'T' },
    { rsid: 'rs12722', gene: 'COL5A1', riskAllele: 'C' },
    { rsid: 'rs10628678', gene: 'COL5A1', riskAllele: 'A' },
    { rsid: 'rs143383', gene: 'GDF5', riskAllele: 'T' },
    { rsid: 'rs1800795', gene: 'IL6', riskAllele: 'A' },
    { rsid: 'rs2228145', gene: 'IL6R', riskAllele: 'C' },
    { rsid: 'rs1799750', gene: 'MMP1', riskAllele: 'A' },
    { rsid: 'rs486055', gene: 'MMP10', riskAllele: 'A' },
    { rsid: 'rs2276109', gene: 'MMP12', riskAllele: 'A' },
    { rsid: 'rs679620', gene: 'MMP3', riskAllele: 'A' },
    { rsid: 'rs28497577', gene: 'MYLK', riskAllele: 'C' },
    { rsid: 'rs1049434', gene: 'SLC16A1', riskAllele: 'T' },
    { rsid: 'rs1800629', gene: 'TNF-alfa', riskAllele: 'A' },
    { rsid: 'rs2707466', gene: 'WNT16', riskAllele: 'G' }
    ],
  },
  {
    id: 'colageno',
    category: 'Dermatologia',
    title: 'Colágeno',
    description: 'Produção e remodelação do colágeno na pele, determinando firmeza, elasticidade e resistência ao envelhecimento.',
    snps: [
    { rsid: 'rs1800012', gene: 'COL1A1', riskAllele: 'C' },
    { rsid: 'rs12722', gene: 'COL5A1', riskAllele: 'T' },
    { rsid: 'rs10628678', gene: 'COL5A1', riskAllele: 'C' },
    { rsid: 'rs1799750', gene: 'MMP1', riskAllele: 'A' },
    { rsid: 'rs486055', gene: 'MMP10', riskAllele: 'A' },
    { rsid: 'rs2276109', gene: 'MMP12', riskAllele: 'A' },
    { rsid: 'rs679620', gene: 'MMP3', riskAllele: 'A' }
    ],
  },
  {
    id: 'envelhecimento',
    category: 'Dermatologia',
    title: 'Envelhecimento Cutâneo',
    description: 'Fatores genéticos do envelhecimento cutâneo, incluindo produção de melanina e proteção contra danos.',
    snps: [
    { rsid: 'rs12203592', gene: 'IRF4', riskAllele: 'T' },
    { rsid: 'rs16927253', gene: 'MACROH2A2', riskAllele: 'C' },
    { rsid: 'rs4746957', gene: 'MACROH2A2', riskAllele: 'G' },
    { rsid: 'rs4268748', gene: 'MC1R', riskAllele: 'C' },
    { rsid: 'rs2228479', gene: 'MC1R', riskAllele: 'C' },
    { rsid: 'rs33972313', gene: 'UNKNOWN', riskAllele: 'T' }
    ],
  },
  {
    id: 'dermatites',
    category: 'Dermatologia',
    title: 'Dermatites',
    description: 'Integridade da barreira cutânea e resposta imune local, determinando susceptibilidade a dermatites.',
    snps: [
    { rsid: 'rs61816761', gene: 'FLG', riskAllele: 'A' },
    { rsid: 'rs1800795', gene: 'IL6', riskAllele: 'G' },
    { rsid: 'rs2228145', gene: 'IL6R', riskAllele: 'C' },
    { rsid: 'rs1800629', gene: 'TNF-alfa', riskAllele: 'A' },
    { rsid: 'rs361525', gene: 'TNF-alfa', riskAllele: 'A' }
    ],
  },
  {
    id: 'esteticas',
    category: 'Dermatologia',
    title: 'Desordens Estéticas',
    description: 'Predisposição genética a desordens estéticas como queloides, hiperpigmentação e alterações vasculares.',
    snps: [
    { rsid: 'rs3910516', gene: 'FN1', riskAllele: 'G' },
    { rsid: 'rs11549465', gene: 'UNKNOWN', riskAllele: 'C' },
    { rsid: 'rs1159268', gene: 'UNKNOWN', riskAllele: 'A' }
    ],
  },
  {
    id: 'estatinas',
    category: 'Medicações',
    title: 'Efeitos Adversos do Uso de Estatinas',
    description: 'Risco de efeitos adversos musculares (miopatia) ao uso de medicamentos estatinas.',
    snps: [
    { rsid: 'rs4693075', gene: 'COQ2', riskAllele: 'G' }
    ],
  },
  {
    id: 'varfarina',
    category: 'Medicações',
    title: 'Varfarina',
    description: 'Metabolismo e sensibilidade à varfarina (anticoagulante), influenciando dose e risco de sangramento.',
    snps: [
    { rsid: 'rs1045642', gene: 'ABCB1', riskAllele: 'C' },
    { rsid: 'rs1801272', gene: 'CYP2A6', riskAllele: 'A' },
    { rsid: 'rs2108622', gene: 'CYP4F2', riskAllele: 'T' },
    { rsid: 'rs4072879', gene: 'VKORC1L1', riskAllele: 'C' }
    ],
  },
  {
    id: 'canabinoides',
    category: 'Medicações',
    title: 'Metabolismo de Canabinoides',
    description: 'Variantes no sistema endocanabinoide e metabolismo de canabinoides exógenos.',
    snps: [
    { rsid: 'rs2494732', gene: 'AKT1', riskAllele: 'C' },
    { rsid: 'rs1130233', gene: 'AKT1', riskAllele: 'C' },
    { rsid: 'rs1049353', gene: 'CNR1', riskAllele: 'T' },
    { rsid: 'rs806380', gene: 'CNR1', riskAllele: 'A' },
    { rsid: 'rs806368', gene: 'CNR1', riskAllele: 'C' }
    ],
  },
  {
    id: 'omeprazol',
    category: 'Medicações',
    title: 'Metabolismo de Omeprazol',
    description: 'Variante no gene CYP2C19 que afeta a metabolização do omeprazol e outros inibidores de bomba de prótons.',
    snps: [
    { rsid: 'rs4986893', gene: 'CYP2C19', riskAllele: 'A' }
    ],
  },
];

module.exports = { PANEL };