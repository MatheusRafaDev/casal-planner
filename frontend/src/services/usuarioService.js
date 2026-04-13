import api from './api';
import authService from './authService';

class UsuarioService {

  #usuarioCache = null;

  async registrar(dados) {
    try {
      const dadosBackend = {
        nomeCompleto: dados.nomeCompleto,
        email: dados.email,
        senha: dados.senha,
        cpf: dados.cpf,
        dataNascimento: dados.dataNascimento,
        rendaMensal: dados.rendaMensal || 0
      };

      const response = await api.post('/usuario/registrar', dadosBackend);
      return response.data;

    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }

  async registrarCasal(dados) {
    try {
      const dadosBackend = {
        nomeCompletoPessoa1: dados.nomeCompletoPessoa1,
        emailPessoa1: dados.emailPessoa1,
        senhaPessoa1: dados.senhaPessoa1,
        cpfPessoa1: dados.cpfPessoa1,
        dataNascimentoPessoa1: dados.dataNascimentoPessoa1,
        rendaMensalPessoa1: dados.rendaMensalPessoa1 || 0,
        nomeCompletoPessoa2: dados.nomeCompletoPessoa2,
        emailPessoa2: dados.emailPessoa2,
        senhaPessoa2: dados.senhaPessoa2,
        cpfPessoa2: dados.cpfPessoa2,
        dataNascimentoPessoa2: dados.dataNascimentoPessoa2,
        rendaMensalPessoa2: dados.rendaMensalPessoa2 || 0,
      };

      const response = await api.post('/usuario/registrar-casal', dadosBackend);

      if (response.data.usuario) {
        this.#usuarioCache = response.data.usuario;
      }

      return response.data;

    } catch (error) {
      console.error('Erro no registro casal:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await api.get('/usuario/me');

      const usuarioAtual = authService.getUsuario();
      if (usuarioAtual) {
        authService.setUsuario({ ...usuarioAtual, ...response.data }); // ✅ agora usa
      }

      return response.data;

    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  async atualizarPerfil(id, dados) {
    try {
      const dadosBackend = {
        nomeCompleto: dados.nomeCompleto,
        dataNascimento: dados.dataNascimento,
        rendaMensal: dados.rendaMensal,
        cpf: dados.cpf
      };

      const response = await api.put(`/usuario/perfil/${id}`, dadosBackend);

      const usuarioAtual = authService.getUsuario();
      if (usuarioAtual && usuarioAtual.id === id) {
        authService.setUsuario({ ...usuarioAtual, ...response.data }); // ✅ corrigido
      }

      return response.data;

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  async atualizarPerfilCasal(id, dados) {
    try {
      const dadosBackend = {
        nomeCompletoPessoa1: dados.nomeCompletoPessoa1,
        dataNascimentoPessoa1: dados.dataNascimentoPessoa1,
        rendaMensalPessoa1: dados.rendaMensalPessoa1,
        nomeCompletoPessoa2: dados.nomeCompletoPessoa2,
        dataNascimentoPessoa2: dados.dataNascimentoPessoa2,
        rendaMensalPessoa2: dados.rendaMensalPessoa2,
      };

      const response = await api.put(`/usuario/perfil-casal/${id}`, dadosBackend);

      const usuarioAtual = authService.getUsuario();
      if (usuarioAtual && usuarioAtual.id === id) {
        authService.setUsuario({ ...usuarioAtual, ...response.data }); // ✅ corrigido
      }

      return response.data;

    } catch (error) {
      console.error('Erro ao atualizar perfil casal:', error);
      throw error;
    }
  }

  async atualizarModoEscuro(id, modoEscuro) {
    try {
      const response = await api.put(`/usuario/modo-escuro/${id}`, { modoEscuro });

      const usuarioAtual = authService.getUsuario();
      if (usuarioAtual && usuarioAtual.id === id) {
        usuarioAtual.modoEscuro = modoEscuro;
        authService.setUsuario(usuarioAtual); // ✅ garante atualização
      }

      return response.data;

    } catch (error) {
      console.error('Erro ao atualizar modo escuro:', error);
      throw error;
    }
  }

  async alterarSenha(dados) {
    try {
      const response = await api.post('/usuario/alterar-senha', dados);
      return response.data;

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw error;
    }
  }

  async excluirConta(id) {
    try {
      const response = await api.delete(`/usuario/usuario/${id}`);
      authService._logoutLocal();
      return response.data;

    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      throw error;
    }
  }
}


const usuarioService = new UsuarioService();
export default usuarioService;
