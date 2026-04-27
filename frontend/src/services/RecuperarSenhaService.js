// services/recuperarSenhaService.js
import api from './api';


class RecuperarSenhaService {
  constructor() {
    this.baseURL = '/RecuperarSenha'; // Controller name
    this.storageKeys = {
      recoveryEmail: '@CasalPlanner:recoveryEmail',
      recoveryToken: '@CasalPlanner:recoveryToken',
      recoveryStep: '@CasalPlanner:recoveryStep'
    };
  }

  /**
   * Passo 1: Solicitar código de recuperação
   */
  async solicitarCodigo(email) {
    try {
      // Validação local
      if (!email || !this.isValidEmail(email)) {
        return {
          success: false,
          message: 'Email inválido',
          code: 'INVALID_EMAIL'
        };
      }

      const response = await api.post(`${this.baseURL}/esqueci-senha`, {
        email: email.trim().toLowerCase()
      });

      // Salvar email na storage
      this.salvarEmailRecuperacao(email);
      this.salvarStepRecuperacao(1);

      return {
        success: true,
        message: response.data.message || 'Código enviado com sucesso!',
        data: response.data
      };
    } catch (error) {
      return this.handleSolicitarCodigoError(error);
    }
  }

  /**
   * Tratamento de erros para solicitação de código
   */
  handleSolicitarCodigoError(error) {
    // Email não encontrado (404)
    if (error.response?.status === 404) {
      const errorData = error.response.data;
      return {
        success: false,
        message: errorData.message || 'Email não encontrado',
        code: errorData.code || 'USER_NOT_FOUND',
        emailExists: false,
        shouldRegister: true
      };
    }

    // Erro no serviço de email (503)
    if (error.response?.status === 503) {
      return {
        success: false,
        message: error.response.data?.message || 'Serviço de email indisponível. Tente mais tarde.',
        code: 'EMAIL_SERVICE_UNAVAILABLE'
      };
    }

    // Erro de validação (400)
    if (error.response?.status === 400) {
      return {
        success: false,
        message: error.response.data?.message || 'Dados inválidos',
        code: 'VALIDATION_ERROR'
      };
    }

    // Erro genérico
    return {
      success: false,
      message: error.response?.data?.message || 'Erro ao enviar código. Tente novamente.',
      code: 'UNKNOWN_ERROR'
    };
  }

  /**
   * Passo 2: Validar código recebido
   */
  async validarCodigo(codigo) {
    try {
      // Validação local
      if (!codigo || !/^\d{6}$/.test(codigo)) {
        return {
          success: false,
          message: 'Código deve conter 6 dígitos numéricos',
          code: 'INVALID_CODE_FORMAT'
        };
      }

      const response = await api.post(`${this.baseURL}/validar-codigo`, {
        codigo: codigo.trim()
      });

      // Salvar token na storage
      if (response.data.token) {
        this.salvarTokenRecuperacao(response.data.token);
        this.salvarStepRecuperacao(2);
      }

      return {
        success: true,
        message: response.data.message || 'Código válido!',
        token: response.data.token,
        data: response.data
      };
    } catch (error) {
      return this.handleValidarCodigoError(error);
    }
  }

  /**
   * Tratamento de erros para validação de código
   */
  handleValidarCodigoError(error) {
    // Código inválido (400)
    if (error.response?.status === 400) {
      const message = error.response.data?.message || 'Código inválido';
      
      // Verificar se é erro de tentativas restantes
      if (message.includes('Tentativas restantes')) {
        const tentativasMatch = message.match(/(\d+)/);
        const tentativasRestantes = tentativasMatch ? parseInt(tentativasMatch[0]) : 0;
        
        return {
          success: false,
          message: message,
          code: 'INVALID_CODE',
          tentativasRestantes: tentativasRestantes,
          isLastAttempt: tentativasRestantes === 1
        };
      }
      
      return {
        success: false,
        message: message,
        code: 'INVALID_CODE'
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || 'Erro ao validar código. Tente novamente.',
      code: 'VALIDATION_ERROR'
    };
  }

  /**
   * Passo 3: Redefinir senha
   */
  async redefinirSenha(novaSenha, confirmarSenha) {
    try {
      // Validações locais
      if (!novaSenha || !confirmarSenha) {
        return {
          success: false,
          message: 'Preencha todos os campos',
          code: 'EMPTY_FIELDS'
        };
      }

      if (novaSenha !== confirmarSenha) {
        return {
          success: false,
          message: 'As senhas não conferem',
          code: 'PASSWORD_MISMATCH'
        };
      }

      if (novaSenha.length < 6) {
        return {
          success: false,
          message: 'A senha deve ter no mínimo 6 caracteres',
          code: 'PASSWORD_TOO_SHORT'
        };
      }

      // Validar força da senha
      const senhaForte = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (!senhaForte.test(novaSenha)) {
        return {
          success: false,
          message: 'A senha deve conter letra maiúscula, minúscula e número',
          code: 'WEAK_PASSWORD'
        };
      }

      const token = this.obterTokenRecuperacao();
      
      if (!token) {
        return {
          success: false,
          message: 'Sessão expirada. Solicite um novo código.',
          code: 'SESSION_EXPIRED',
          shouldRestart: true
        };
      }

      const response = await api.post(`${this.baseURL}/redefinir-senha`, {
        token: token,
        novaSenha: novaSenha
      });

      // Limpar dados da storage após sucesso
      this.limparDadosRecuperacao();

      return {
        success: true,
        message: response.data.message || 'Senha redefinida com sucesso!',
        data: response.data
      };
    } catch (error) {
      return this.handleRedefinirSenhaError(error);
    }
  }

  /**
   * Tratamento de erros para redefinição de senha
   */
  handleRedefinirSenhaError(error) {
    // Token inválido/expirado (401)
    if (error.response?.status === 401) {
      return {
        success: false,
        message: error.response.data?.message || 'Sessão expirada. Solicite um novo código.',
        code: 'SESSION_EXPIRED',
        shouldRestart: true
      };
    }

    // Erro de validação (400)
    if (error.response?.status === 400) {
      return {
        success: false,
        message: error.response.data?.message || 'Senha inválida',
        code: 'INVALID_PASSWORD'
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || 'Erro ao redefinir senha. Tente novamente.',
      code: 'RESET_ERROR'
    };
  }

  /**
   * Reenviar código
   */
  async reenviarCodigo(email) {
    // Aguardar 1 segundo antes de reenviar (evitar spam)
    await this.delay(1000);
    
    const result = await this.solicitarCodigo(email);
    
    if (result.success) {
      return {
        success: true,
        message: 'Novo código enviado! Verifique seu email.',
        countdown: 60
      };
    }
    
    return result;
  }

  /**
   * Verificar status atual da recuperação
   */
  verificarStatus() {
    const email = this.obterEmailRecuperacao();
    const token = this.obterTokenRecuperacao();
    const step = this.obterStepRecuperacao();
    
    return {
      hasEmail: !!email,
      hasToken: !!token,
      step: step || 1,
      email: email,
      isTokenValid: token && step === 2
    };
  }

  /**
   * Storage methods
   */
  salvarEmailRecuperacao(email) {
    try {
      localStorage.setItem(this.storageKeys.recoveryEmail, email);
    } catch (error) {
      console.error('Erro ao salvar email:', error);
    }
  }

  obterEmailRecuperacao() {
    try {
      return localStorage.getItem(this.storageKeys.recoveryEmail);
    } catch (error) {
      return null;
    }
  }

  salvarTokenRecuperacao(token) {
    try {
      localStorage.setItem(this.storageKeys.recoveryToken, token);
    } catch (error) {
      console.error('Erro ao salvar token:', error);
    }
  }

  obterTokenRecuperacao() {
    try {
      return localStorage.getItem(this.storageKeys.recoveryToken);
    } catch (error) {
      return null;
    }
  }

  salvarStepRecuperacao(step) {
    try {
      localStorage.setItem(this.storageKeys.recoveryStep, step.toString());
    } catch (error) {
      console.error('Erro ao salvar step:', error);
    }
  }

  obterStepRecuperacao() {
    try {
      const step = localStorage.getItem(this.storageKeys.recoveryStep);
      return step ? parseInt(step) : 1;
    } catch (error) {
      return 1;
    }
  }

  limparDadosRecuperacao() {
    try {
      localStorage.removeItem(this.storageKeys.recoveryEmail);
      localStorage.removeItem(this.storageKeys.recoveryToken);
      localStorage.removeItem(this.storageKeys.recoveryStep);
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  }

  /**
   * Helpers
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Exportar instância única
const recuperarSenhaService = new RecuperarSenhaService();
export default recuperarSenhaService;