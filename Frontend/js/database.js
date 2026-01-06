/* js/database.js */

// 1. Árvore de Navegação
export const treeStructure = [
    {
        name: "Crateús",
        children: [
            { name: "UFC", children: ["Ciência da Computação", "Sistemas de Informação", "Engenharia Civil", "Secretaria Acadêmica", "CEO of S.E.X"] },
            { name: "Prefeitura", children: ["Gabinete", "Finanças", "Obras", "Saúde"] }
        ]
    },
    {
        name: "Ipu",
        children: [
            { name: "Wolga", children: ["Financeiro", "Logística", "Produção", "Vendas"] },
            { name: "Hospital Municipal", children: ["Recepção", "Emergência", "Administração"] }
        ]
    }
];

const fakeAddresses = [
    "Bloco Administrativo, Sala 101", "1º Andar, Sala 05", "Prédio Anexo, Sala 3", 
    "Bloco Didático, Lab 02", "Recepção Principal", "Galpão B", "Sala de Reuniões 04"
];

// --- 1. FUNÇÃO MÁGICA: Converte Árvore Hierárquica em Tabela de Banco ---
// Isso garante que o banco tenha EXATAMENTE o que está na árvore
// --- CORREÇÃO AQUI: Adiciona 'localizacao' aos setores ---
export const getFlatSectorsForDB = () => {
    const flatList = [];
    let idCounter = 1;

    treeStructure.forEach(city => {
        city.children.forEach(company => {
            if (Array.isArray(company.children)) {
                company.children.forEach((sectorName, index) => {
                    flatList.push({
                        id: (idCounter++).toString(),
                        nome: sectorName,
                        empresa: company.name,
                        cidade: city.name,
                        // Gera um endereço fixo baseado no índice para não mudar sempre
                        localizacao: fakeAddresses[index % fakeAddresses.length], 
                        observacao: "Gerado automaticamente pelo sistema."
                    });
                });
            }
        });
    });
    return flatList;
};

// Helper antigo (apenas nomes) - mantido para compatibilidade se algo usar
const getAllSectors = () => {
    return getFlatSectorsForDB().map(s => s.nome);
};

const sectorsList = getAllSectors();
const types = ["Administrador", "Técnico", "Usuário Comum"];
const models = [
    // Dell
    "Dell OptiPlex 3050", "Dell OptiPlex 3080", "Dell OptiPlex 3090", "Dell OptiPlex 5000",
    "Dell Latitude 5420", "Dell Latitude 5430", "Dell Latitude 5440", "Dell Latitude 3520",
    "Dell Vostro 3400", "Dell Vostro 3510",

    // Lenovo
    "Lenovo ThinkPad E14", "Lenovo ThinkPad E15", "Lenovo ThinkPad L14", "Lenovo ThinkPad L15",
    "Lenovo ThinkCentre M70q", "Lenovo ThinkCentre M80s",

    // HP
    "HP ProDesk 600", "HP ProDesk 400", "HP EliteDesk 800",
    "HP ProBook 440 G8", "HP ProBook 450 G9", "HP EliteBook 840 G8",

    // Positivo
    "Positivo Master", "Positivo Motion C", "Positivo Vision R15",

    // Outros
    "Acer Veriton M200", "Acer Aspire 5", "ASUS VivoBook 15"
];

const printerModels = [
    // HP
    "HP LaserJet Pro M404dw", "HP LaserJet Pro M428fdw",
    "HP LaserJet MFP M135w", "HP LaserJet P1102w",

    // Epson
    "Epson EcoTank L3250", "Epson EcoTank L4260", "Epson EcoTank L6270",
    "Epson EcoTank M2170",

    // Brother
    "Brother HL-L2360DW", "Brother HL-L2370DW",
    "Brother DCP-L2540DW", "Brother MFC-L2750DW",

    // Kyocera
    "Kyocera ECOSYS P2040dn", "Kyocera ECOSYS M2040dn",

    // Canon
    "Canon imageCLASS MF264dw", "Canon imageCLASS LBP6030w"
];

const names = [
    "Jonathan Joestar", "Joseph Joestar", "Jotaro Kujo", "Josuke Higashikata", "Giorno Giovanna", 
    "Dio Brando", "Kars", "Yoshikage Kira", "Diavolo", "Enrico Pucci", 
    "Robert Speedwagon", "Will Zeppeli", "Lisa Lisa", "Koichi Hirose", "Rohan Kishibe",
    "Bruno Bucciarati", "Guido Mista", "Narancia Ghirga",

    // Hunter x Hunter
    "Gon Freecss", "Killua Zoldyck", "Kurapika", "Leorio Paradinight",
    "Hisoka Morow", "Isaac Netero", "Biscuit Krueger", "Wing", "Zushi",
    "Kite", "Knuckle Bine", "Shoot McMahon", "Morel Mackernasey",
    "Palm Siberia", "Ikalgo", "Meleoron",
    "Chrollo Lucilfer", "Feitan Portor", "Phinks Magcub", "Nobunaga Hazama",
    "Machi Komacine", "Franklin Bordeau", "Shalnark", "Pakunoda",
    "Kortopi", "Uvogin", "Bonolenov Ndongo", "Kalluto Zoldyck",
    "Illumi Zoldyck", "Milluki Zoldyck", "Silva Zoldyck", "Zeno Zoldyck",
    "Alluka Zoldyck", "Nanika",
    "Meruem", "Neferpitou", "Shaiapouf", "Menthuthuyoupi",
    "Komugi", "Colt", "Reina",
    "Pariston Hill", "Ging Freecss", "Beyond Netero",
    "Cheadle Yorkshire", "Mizaistom Nana", "Botobai Gigante",
    "Kanzai", "Saccho Kobayakawa",

    // Fullmetal Alchemist: Brotherhood
    "Edward Elric", "Alphonse Elric", "Winry Rockbell", "Pinako Rockbell",
    "Roy Mustang", "Riza Hawkeye", "Maes Hughes", "Gracia Hughes", "Elicia Hughes",
    "Jean Havoc", "Heymans Breda", "Vato Falman", "Kain Fuery",
    "Alex Louis Armstrong", "Olivier Mira Armstrong",
    "Scar", "Scar's Brother",
    "Ling Yao", "Lan Fan", "Fu",
    "May Chang", "Xiao-Mei",
    "Van Hohenheim", "Trisha Elric",
    "King Bradley", "Mrs. Bradley (Selim's mother)",
    "Selim Bradley (Pride)", "Father",
    "Lust", "Gluttony", "Envy", "Greed", "Greed (Ling)", "Sloth", "Wrath", "Pride",
    "Izumi Curtis", "Sig Curtis",
    "Shou Tucker", "Nina Tucker",
    "Yoki",
    "Maria Ross", "Denny Brosh",
    "Basque Grand",
    "Buccaneer",
    "Tim Marcoh",
    "Solf J. Kimblee",

    // Frieren: Beyond Journey’s End
    "Frieren", "Fern", "Stark",
    "Himmel", "Heiter", "Eisen",
    "Flamme",
    "Aura the Guillotine", "Lügner", "Linie", "Draht",
    "Denken", "Laufen", "Richter",
    "Wirbel", "Ehre", "Scharf",
    "Übel", "Land",
    "Serie",
    "Sense",
    "Falsch",
    "Revolte",
    "Grausam",
    "Macht",
    "Böse",
    "Tot"
];

// --- FUNÇÃO GERADORA DE CPF VÁLIDO (Matemática) ---
function gerarCpfValido() {
    const rnd = (n) => Math.round(Math.random() * n);
    const mod = (dividend, divisor) => Math.round(dividend - (Math.floor(dividend / divisor) * divisor));

    const n1 = rnd(9); const n2 = rnd(9); const n3 = rnd(9);
    const n4 = rnd(9); const n5 = rnd(9); const n6 = rnd(9);
    const n7 = rnd(9); const n8 = rnd(9); const n9 = rnd(9);

    let d1 = n9 * 2 + n8 * 3 + n7 * 4 + n6 * 5 + n5 * 6 + n4 * 7 + n3 * 8 + n2 * 9 + n1 * 10;
    d1 = 11 - (mod(d1, 11));
    if (d1 >= 10) d1 = 0;

    let d2 = d1 * 2 + n9 * 3 + n8 * 4 + n7 * 5 + n6 * 6 + n5 * 7 + n4 * 8 + n3 * 9 + n2 * 10 + n1 * 11;
    d2 = 11 - (mod(d2, 11));
    if (d2 >= 10) d2 = 0;

    return `${n1}${n2}${n3}.${n4}${n5}${n6}.${n7}${n8}${n9}-${d1}${d2}`;
}

// --- 1. USUÁRIOS FIXOS (Para Teste) ---
export const usersData = [
    {
        id: "1",
        nome: "Edward Elric",
        cpf: "277.304.900-48",
        senha: "123",
        tipo: "Administrador",
        setor: "Ciência da Computação"
    },
    {
        id: "2",
        nome: "Alphonse Elric",
        cpf: "693.082.880-74",
        senha: "123",
        tipo: "Técnico",
        setor: "Sistemas de Informação"
    },
    {
        id: "3",
        nome: "Roy Mustang",
        cpf: "486.051.580-34",
        senha: "123",
        tipo: "Usuário Comum",
        setor: "Secretaria Acadêmica"
    },
    {
        id: "4",
        nome: "Sicrano Fulano Beltrano Alano Mengano Zutano Citano Perengano",
        cpf: "080.572.663-25",
        senha: "123",
        tipo: "Administrador",
        setor: "CEO of S.E.X"
    }
];

// --- 2. GERAR MAIS 50 USUÁRIOS ALEATÓRIOS ---
for (let i = 0; i < 100; i++) {
    const name = names[i % names.length] + (i >= names.length ? ` ${Math.floor(i/names.length)}` : "");
    const tipo = types[i % 3]; // Alterna entre os 3 tipos
    
    usersData.push({
        id: (i + 5).toString(), // Começa do ID 4
        nome: name,
        cpf: gerarCpfValido(), // Gera CPF real para passar na validação
        senha: "123",
        tipo: tipo,
        setor: sectorsList[i % sectorsList.length]
    });
}

// --- 3. GERAR EQUIPAMENTOS ---
export const equipmentsData = [];

// Gera computadores para a maioria dos usuários (incluindo os fixos e os aleatórios)
usersData.forEach((user, index) => {
    // Pula alguns para variar (a cada 5, um não tem PC)
    if (index % 5 === 0 && index > 2) return; 
    
    const pcId = `C${index + 1}`;
    
    equipmentsData.push({
        id: pcId,
        tipo: "computador",
        serie: `PC-${1000 + index}`,
        modelo: models[index % models.length],
        usuario: user.nome,
        status: index % 7 === 0 ? "Offline" : "Online",
        setor: user.setor,
        contador: "-",
        tonel: "-",
        error: index % 15 === 0 ? "Erro de Disco" : null,
        connectedTo: null
    });
});

// Gera Impressoras (algumas conectadas aos PCs gerados)
for (let i = 0; i < 50; i++) {
    const parentPC = equipmentsData[Math.floor(Math.random() * equipmentsData.length)];
    
    equipmentsData.push({
        id: `P${i + 1}`,
        tipo: "impressora",
        serie: `PRT-${5000 + i}`,
        modelo: printerModels[i % printerModels.length],
        usuario: "Compartilhado",
        status: i % 4 === 0 ? "Offline" : "Online",
        setor: sectorsList[i % sectorsList.length],
        contador: (Math.floor(Math.random() * 50000)) + " pgs",
        tonel: (Math.floor(Math.random() * 100)) + "%",
        error: i % 10 === 0 ? "Sem Papel" : null,
        connectedTo: parentPC ? parentPC.id : null
    });
}

// --- DEBUG NO CONSOLE ---
console.groupCollapsed("%c🔑 CREDENCIAIS FIXAS", "color: #4FD1C5; background: #333; padding: 4px; border-radius: 4px;");
console.log("Admin:   277.304.900-48");
console.log("Técnico: 693.082.880-74");
console.log("Comum:   486.051.580-34");
console.groupEnd();