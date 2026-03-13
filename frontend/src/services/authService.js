import api from './api';

class AuthService {

  async login(dados) {
    try {
      const response = await api.post('/auth/login', dados);

      if (response.data.token) {
        this._salvarToken(response.data.token);
        

        const usuario = this._padronizarUsuario(response.data);
        this._salvarUsuario(usuario);
        
        return usuario;
      }
      return response.data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      this._logoutLocal();
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUsuario() {
    try {
      const usuario = localStorage.getItem('usuario');
      return usuario ? JSON.parse(usuario) : null;
    } catch (error) {
      console.error('Erro ao parsear usuário:', error);
      return null;
    }
  }

  estaAutenticado() {
    return !!this.getToken();
  }

  _salvarToken(token) {
    localStorage.setItem('token', token);
  }

  _salvarUsuario(usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  _logoutLocal() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  _padronizarUsuario(data) {

    if (data.isCasal !== undefined) {
      return {
        id: data.id,
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        token: data.token,
        isCasal: data.isCasal,
        tipoConta: data.isCasal ? '1' : '0',
        modoEscuro: data.modoEscuro || true,
        pessoaQueLogou: data.pessoaQueLogou,
        casalInfo: data.casalInfo,
        rendaMensal: data.rendaMensal,
        cpf: data.cpf,
        dataNascimento: data.dataNascimento,
        createdAt: data.createdAt || data.dataInclusao
      };
    }

    if (data.tipoConta === 'Casal' || data.isCasal) {
      return {
        id: data.id,
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        token: data.token,
        isCasal: true,
        tipoConta: '1',
        modoEscuro: data.modoEscuro || false,
        pessoaQueLogou: data.pessoaQueLogou || 'pessoa1',
        rendaMensal: data.rendaMensal,
        casalInfo: {
          nomeCompletoPessoa1: data.nomeCompletoPessoa1 || data.casalInfo?.nomeCompletoPessoa1,
          emailPessoa1: data.emailPessoa1 || data.casalInfo?.emailPessoa1,
          cpfPessoa1: data.cpfPessoa1 || data.casalInfo?.cpfPessoa1,
          dataNascimentoPessoa1: data.dataNascimentoPessoa1 || data.casalInfo?.dataNascimentoPessoa1,
          rendaMensalPessoa1: data.rendaMensalPessoa1 || data.casalInfo?.rendaMensalPessoa1,
          
          nomeCompletoPessoa2: data.nomeCompletoPessoa2 || data.casalInfo?.nomeCompletoPessoa2,
          emailPessoa2: data.emailPessoa2 || data.casalInfo?.emailPessoa2,
          cpfPessoa2: data.cpfPessoa2 || data.casalInfo?.cpfPessoa2,
          dataNascimentoPessoa2: data.dataNascimentoPessoa2 || data.casalInfo?.dataNascimentoPessoa2,
          rendaMensalPessoa2: data.rendaMensalPessoa2 || data.casalInfo?.rendaMensalPessoa2,
          
          dataCasamento: data.dataCasamento || data.casalInfo?.dataCasamento
        },
        createdAt: data.createdAt || data.dataInclusao
      };
    } 
    

    else {
      return {
        id: data.id,
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        token: data.token,
        isCasal: false,
        tipoConta: '0',
        modoEscuro: data.modoEscuro || false,
        rendaMensal: data.rendaMensal,
        cpf: data.cpf,
        dataNascimento: data.dataNascimento,
        createdAt: data.createdAt || data.dataInclusao
      };
    }
  }
}

export default new AuthService();