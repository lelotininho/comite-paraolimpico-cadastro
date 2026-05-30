#!/usr/bin/env bash
set -e

info() {
  printf "\033[1;34m%s\033[0m\n" "$1"
}

warn() {
  printf "\033[1;33m%s\033[0m\n" "$1"
}

error() {
  printf "\033[1;31m%s\033[0m\n" "$1"
  exit 1
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

detect_os() {
  local uname_out
  uname_out="$(uname -s)"
  case "${uname_out}" in
    Linux*) echo linux ;;
    Darwin*) echo macos ;;
    *) echo unknown ;;
  esac
}

info "Iniciando setup do projeto — CPB Registrar Clube"
os="$(detect_os)"
info "Sistema detectado: ${os}"

if ! command_exists node; then
  error "Node.js não encontrado. Instale Node.js 18+ antes de continuar."
fi

if ! command_exists npm; then
  error "npm não encontrado. Instale Node.js/npm antes de continuar."
fi

if [ "${os}" = "macos" ]; then
  if ! command_exists brew; then
    warn "Homebrew não está instalado."
    echo "Execute para instalar Homebrew:"
    echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    warn "Depois instale o gh e, opcionalmente, k6."
    echo "  brew install gh"
    echo "  brew install k6"
  else
    info "Homebrew encontrado."
    if ! command_exists gh; then
      info "Instalando GitHub CLI (gh)..."
      brew install gh
    fi
    if ! command_exists k6; then
      warn "k6 não encontrado. Ele é necessário apenas para executar \`npm run perf\`."
      echo "  brew install k6"
    fi
  fi
fi

info "Instalando dependências npm..."
npm install

info "Instalando Cypress..."
npx cypress install

if [ -f .env.example ] && [ ! -f .env ]; then
  info "Criando .env a partir de .env.example..."
  cp .env.example .env
  warn "O arquivo .env foi criado. Revise as configurações antes de executar os testes."
fi

info "Setup concluído!"
echo
echo "Próximos passos:"
echo "  npm run test:flow"
echo "  npm run test:positive"
echo "  npm run test:negative"
echo "  npm run test:api"
echo "  npm run test:open   # interface gráfica"
echo "  npm run perf        # requer k6 instalado"

echo
if [ ! -d .git ]; then
  echo "Para inicializar repositório git local: git init && git add . && git commit -m 'Initial project setup'"
fi
