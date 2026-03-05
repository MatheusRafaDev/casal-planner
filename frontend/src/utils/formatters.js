// src/utils/formatters.js
import { DollarSign, ShoppingBag } from 'lucide-react';
import React from 'react';

export const formatarMoeda = (valor) => {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const getPaymentIcon = (tipo) => {
  return tipo === 'vr' ? <DollarSign size={12} /> : <ShoppingBag size={12} />;
};