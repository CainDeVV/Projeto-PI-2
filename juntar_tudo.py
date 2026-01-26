import os

# Extensões permitidas
extensions = [
    '.html', '.css', '.js', '.java', '.json', '.xml', 
    '.yml', '.yaml', '.properties', '.gradle', '.env', '.md'
]

# Arquivos sem extensão ou nomes específicos
special_files = ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml']

# Pastas para ignorar (Lista única e completa)
ignore_dirs = {
    'node_modules', '.git', '.vscode', 'images', 'icons', 
    '.idea', 'target', 'build', 'dist', '.mvn', '__pycache__'
}

output_file = 'PROJETO_COMPLETO.txt'

with open(output_file, 'w', encoding='utf-8') as outfile:
    for root, dirs, files in os.walk('.'):
        # Filtra as pastas para não entrar nelas (modifica o dirs in-place)
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        
        for file in files:
            # Verifica se o arquivo termina com a extensão OU se o nome está na lista especial
            if any(file.endswith(ext) for ext in extensions) or file in special_files:
                filepath = os.path.join(root, file)
                
                # Evita que o script leia o próprio arquivo de saída
                if file == output_file:
                    continue

                outfile.write(f"\n{'='*50}\n")
                outfile.write(f"CAMINHO: {filepath}\n")
                outfile.write(f"{'='*50}\n")
                
                try:
                    with open(filepath, 'r', encoding='utf-8') as infile:
                        outfile.write(infile.read())
                except Exception as e:
                    outfile.write(f"\n[Erro ao ler arquivo: {e}]\n")

print(f"Pronto! O arquivo '{output_file}' foi criado.")