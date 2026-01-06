import os

# Extensões que queremos ler
extensions = ['.html', '.css', '.js', '.json']
# Pastas para IGNORAR (importante para não pegar lixo)
ignore_dirs = ['node_modules', '.git', '.vscode', 'images', 'icons']
output_file = 'PROJETO_COMPLETO.txt'

with open(output_file, 'w', encoding='utf-8') as outfile:
    for root, dirs, files in os.walk('.'):
        # Remove pastas ignoradas da busca
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                filepath = os.path.join(root, file)
                # Escreve um cabeçalho para eu saber qual arquivo é
                outfile.write(f"\n{'='*50}\n")
                outfile.write(f"CAMINHO: {filepath}\n")
                outfile.write(f"{'='*50}\n")
                try:
                    with open(filepath, 'r', encoding='utf-8') as infile:
                        outfile.write(infile.read())
                except Exception as e:
                    outfile.write(f"Erro ao ler arquivo: {e}")

print(f"Pronto! O arquivo '{output_file}' foi criado. Agora é só anexar no chat.")