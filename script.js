let posts = [];
let usuarioAtual = null;

const STORAGE_POSTS_KEY = 'emedmoz_posts';
const STORAGE_USER_KEY = 'usuarioEmedmoz';

const dominiosUniversidade = {
  UCM: "ucm.emed.mz",
  UEM: "uem.emed.mz",
  UNISOM: "unisom.emed.mz",
  UNIAC: "uniac.emed.mz",
  UZ: "uz.emed.mz"
};

// ==================== CARREGAR DADOS ====================
function carregarDados() {
  const postsSalvos = localStorage.getItem(STORAGE_POSTS_KEY);
  if (postsSalvos) posts = JSON.parse(postsSalvos);

  const perfilSalvo = localStorage.getItem(STORAGE_USER_KEY);
  if (perfilSalvo) usuarioAtual = JSON.parse(perfilSalvo);
}

function salvarPosts() {
  localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
}

// ==================== GERAÇÃO AUTOMÁTICA DE EMAIL ====================
function gerarEmailAutomatico() {
  const uniSelect = document.getElementById('criar-universidade');
  const nomeInput = document.getElementById('criar-nome').value.trim();
  const emailField = document.getElementById('criar-email');

  if (!uniSelect.value || !nomeInput) return;

  const partes = nomeInput
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\s+/)
    .filter(p => p.length > 0);

  const primeiroNome = partes[0] || "";
  const ultimoNome = partes.length > 1 ? partes[partes.length - 1] : "";

  const dominio = dominiosUniversidade[uniSelect.value];

  const emailGerado = `${primeiroNome}${ultimoNome ? "" + ultimoNome : ""}@${dominio}`;

  emailField.value = emailGerado;
}


// ==================== CONTROLAR PROPEDÊUTICO - CRIAR PERFIL ====================
function controlarPropedeutico() {
  const uniSelect = document.getElementById('criar-universidade');
  const anoSelect = document.getElementById('criar-ano');

  if (!uniSelect || !anoSelect) return;

  const opcaoPropedeutico = anoSelect.querySelector('option[value="Propedêutico"]');

  if (uniSelect.value === 'UCM') {
    opcaoPropedeutico.disabled = false;
  } else {
    opcaoPropedeutico.disabled = true;
    if (anoSelect.value === 'Propedêutico') anoSelect.value = '';
  }
}

// ==================== CONTROLAR PROPEDÊUTICO - EDITAR PERFIL ====================
function controlarPropedeuticoEditar() {
  const uniSelect = document.getElementById('edit-universidade');
  const anoSelect = document.getElementById('edit-ano');

  if (!uniSelect || !anoSelect) return;

  const opcaoPropedeutico = anoSelect.querySelector('option[value="Propedêutico"]');

  if (uniSelect.value === 'UCM') {
    opcaoPropedeutico.disabled = false;
  } else {
    opcaoPropedeutico.disabled = true;
    if (anoSelect.value === 'Propedêutico') {
      anoSelect.value = '';
    }
  }
}

// ==================== PERFIL ====================
function mostrarModalCriacaoPerfil() {
  const modal = document.getElementById('modal-criar-perfil');
  modal.classList.add('active');
  modal.classList.remove('hidden');
  controlarPropedeutico(); 
}

function criarPerfil() {
  const nome = document.getElementById('criar-nome').value.trim();
  const universidade = document.getElementById('criar-universidade').value;
  const ano = document.getElementById('criar-ano').value;
  const email = document.getElementById('criar-email').value.trim();

  if (!nome || !universidade || !ano) {
    alert("❌ Nome completo, Universidade e Ano/Semestre são obrigatórios!");
    return;
  }

  const avatarInput = document.getElementById('criar-avatar');
  const avatarFile = avatarInput.files[0];

  if (avatarFile) {
    cortarImagemQuadrada(avatarFile, function (imagemFinal) {
      usuarioAtual = { nome, universidade, curso: "Medicina", ano, email,
        bio: document.getElementById('criar-bio').value.trim() || "Estudante de Medicina.",
        interesses: document.getElementById('criar-interesses').value.trim() || "",
        avatar: imagemFinal
      };
      finalizarCriacaoPerfil(nome);
    });
    return;
  }

  usuarioAtual = { nome, universidade, curso: "Medicina", ano, email,
    bio: document.getElementById('criar-bio').value.trim() || "Estudante de Medicina.",
    interesses: document.getElementById('criar-interesses').value.trim() || "",
    avatar: "👩‍⚕️"
  };

  finalizarCriacaoPerfil(nome);
}

function finalizarCriacaoPerfil(nome) {
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(usuarioAtual));
  const modal = document.getElementById('modal-criar-perfil');
  modal.classList.remove('active');
  modal.classList.add('hidden');

  atualizarPerfil();
  showSection('home');
  alert(`✅ Perfil criado com sucesso, ${nome.split(" ")[0]}!`);
}

// ==================== ATUALIZAR PERFIL ====================
function atualizarPerfil() {
  if (!usuarioAtual) return;

  document.getElementById('profile-name').textContent = usuarioAtual.nome;
  document.getElementById('profile-course').textContent = `${usuarioAtual.ano || '—'} - Medicina`;
  document.getElementById('profile-university').textContent = usuarioAtual.universidade;

  const avatarElement = document.getElementById('profile-avatar');
  if (usuarioAtual.avatar && usuarioAtual.avatar.startsWith('data:image')) {
    avatarElement.innerHTML = `<img src="${usuarioAtual.avatar}" alt="Foto de perfil">`;
  } else {
    avatarElement.innerHTML = `<span style="font-size:85px">${usuarioAtual.avatar || "👩‍⚕️"}</span>`;
  }

  document.getElementById('profile-email').textContent = usuarioAtual.email || "-";
  document.getElementById('profile-bio').textContent = usuarioAtual.bio || "-";
  document.getElementById('profile-interesses').textContent = usuarioAtual.interesses || "-";

  atualizarEstatisticas();
}

function atualizarEstatisticas() {
  if (!usuarioAtual) return;
  const postsUsuario = posts.filter(p => p.autor === usuarioAtual.nome);
  const curtidas = postsUsuario.reduce((acc, p) => acc + (p.curtidas || 0), 0);

  const stats = document.querySelectorAll('.stat-item strong');
  if (stats.length >= 3) {
    stats[0].textContent = postsUsuario.length;
    stats[1].textContent = curtidas;
    stats[2].textContent = "0";
  }
}

// ==================== EDITAR PERFIL ====================
function editarPerfil() {
  if (!usuarioAtual) return;

  document.getElementById('edit-nome').value = usuarioAtual.nome;
  document.getElementById('edit-universidade').value = usuarioAtual.universidade;
  document.getElementById('edit-ano').value = usuarioAtual.ano || '';
  document.getElementById('edit-email').value = usuarioAtual.email || '';
  document.getElementById('edit-bio').value = usuarioAtual.bio || '';
  document.getElementById('edit-interesses').value = usuarioAtual.interesses || '';

  document.getElementById('modal-editar-perfil').classList.add('active');
  document.getElementById('modal-editar-perfil').classList.remove('hidden');

  // Aplicar restrição de Propedêutico ao abrir o modal de edição
  controlarPropedeuticoEditar();
}

function salvarPerfil() {
  if (!usuarioAtual) return;

  const avatarFile = document.getElementById('edit-avatar').files[0];

  if (avatarFile) {
    cortarImagemQuadrada(avatarFile, (imagemFinal) => {
      usuarioAtual.avatar = imagemFinal;
      salvarEAtualizarPerfil();
    });
    return;
  }

  salvarEAtualizarPerfil();
}

function salvarEAtualizarPerfil() {
  usuarioAtual.nome = document.getElementById('edit-nome').value.trim();
  usuarioAtual.universidade = document.getElementById('edit-universidade').value;
  usuarioAtual.ano = document.getElementById('edit-ano').value;
  usuarioAtual.email = document.getElementById('edit-email').value.trim();
  usuarioAtual.bio = document.getElementById('edit-bio').value.trim();
  usuarioAtual.interesses = document.getElementById('edit-interesses').value.trim();

  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(usuarioAtual));
  atualizarPerfil();
  fecharModalEditarPerfil();
  alert("✅ Perfil atualizado com sucesso!");
}

function fecharModalEditarPerfil() {
  const modal = document.getElementById('modal-editar-perfil');
  modal.classList.remove('active');
  modal.classList.add('hidden');
}

// ==================== CORTE DE IMAGEM ====================
function cortarImagemQuadrada(file, callback) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, (img.width - size)/2, (img.height - size)/2, size, size, 0, 0, size, size);
      callback(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ==================== OUTRAS FUNÇÕES ====================
function logout() {
  if (confirm("Deseja realmente sair?")) {
    localStorage.removeItem(STORAGE_USER_KEY);
    location.reload();
  }
}

function showSection(section) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active', 'hidden'));
  const target = document.getElementById(`${section}-section`);
  if (target) {
    target.classList.add('active');
    target.classList.remove('hidden');
  }

  document.querySelectorAll('.bottom-nav a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('onclick').includes(`'${section}'`)) link.classList.add('active');
  });
}

function abrirModalNovoPost() {
  if (!usuarioAtual) {
    alert("Crie seu perfil primeiro!");
    showSection('perfil');
    return;
  }
  document.getElementById('modal-novo-post').classList.add('active');
  document.getElementById('modal-novo-post').classList.remove('hidden');
}

function fecharModal() {
  const modal = document.getElementById('modal-novo-post');
  modal.classList.remove('active');
  modal.classList.add('hidden');
}

function publicarPost() {
  if (!usuarioAtual) return;
  const titulo = document.getElementById('post-titulo').value.trim();
  const conteudo = document.getElementById('post-conteudo').value.trim();

  if (!titulo || !conteudo) {
    alert("Preencha o título e o conteúdo!");
    return;
  }

  const novoPost = {
    id: Date.now(),
    titulo,
    conteudo,
    autor: usuarioAtual.nome,
    data: new Date().toLocaleDateString('pt-PT'),
    curtidas: 0
  };

  posts.unshift(novoPost);
  salvarPosts();
  renderizarPosts();
  fecharModal();
}

function curtirPost(id) {
  const post = posts.find(p => p.id === id);
  if (post) {
    post.curtidas = (post.curtidas || 0) + 1;
    salvarPosts();
    renderizarPosts();
  }
}

function renderizarPosts() {
  const container = document.getElementById('posts-container');
  if (!container) return;

  container.innerHTML = posts.length === 0 
    ? `<p style="color:#94a3b8; text-align:center; padding:80px 20px;">Nenhum tópico ainda.<br>Seja o primeiro a publicar!</p>`
    : posts.map(post => `
      <div class="post">
        <div class="post-title">${post.titulo}</div>
        <div class="post-content">${post.conteudo}</div>
        <div class="post-footer">
          <span>👤 ${post.autor}</span>
          <span>📅 ${post.data}</span>
          <span onclick="curtirPost(${post.id})" style="cursor:pointer;">❤️ ${post.curtidas || 0}</span>
        </div>
      </div>
    `).join('');
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
  // Para o modal de criar perfil
  const uniCriar = document.getElementById('criar-universidade');
  if (uniCriar) uniCriar.addEventListener('change', () => {
    gerarEmailAutomatico();
    controlarPropedeutico();
  });

  const anoCriar = document.getElementById('criar-ano');
  if (anoCriar) anoCriar.addEventListener('change', gerarEmailAutomatico);

  // Para o modal de editar perfil
  const uniEditar = document.getElementById('edit-universidade');
  if (uniEditar) uniEditar.addEventListener('change', controlarPropedeuticoEditar);
});

// ==================== INICIALIZAÇÃO ====================
window.onload = function () {
  carregarDados();
  renderizarPosts();

  if (!usuarioAtual) {
    mostrarModalCriacaoPerfil();
  } else {
    atualizarPerfil();
    showSection('home');
  }
};