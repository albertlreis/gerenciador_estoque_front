import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import MovimentacoesEstoque from './MovimentacoesEstoque';
import apiEstoque from '../services/apiEstoque';

const mockToastShow = jest.fn();
const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = jest.fn();
let lastFiltroProps = null;

jest.mock('../services/apiEstoque', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

jest.mock('react-router-dom', () => ({
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}), { virtual: true });

jest.mock('primereact/accordion', () => ({
  Accordion: ({ children }) => <div>{children}</div>,
  AccordionTab: ({ children }) => <div>{children}</div>,
}));

jest.mock('primereact/toast', () => {
      const ReactLib = require('react');
      return {
    Toast: ReactLib.forwardRef((props, ref) => {
      ReactLib.useImperativeHandle(ref, () => ({ show: mockToastShow }));
      return <div data-testid="toast" />;
    }),
  };
});

jest.mock('primereact/card', () => ({
  Card: ({ children }) => <div>{children}</div>,
}));

jest.mock('primereact/dialog', () => ({
  Dialog: ({ visible, children }) => (visible ? <div data-testid="dialog">{children}</div> : null),
}));

jest.mock('../layouts/SakaiLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../components/LocalizacaoEstoqueDialog', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../components/EstoqueFiltro', () => ({
  __esModule: true,
  default: (props) => {
    lastFiltroProps = props;
    return (
      <div>
        <input
          aria-label="produto"
          value={props.filtros.produto}
          onChange={(e) => {
            if (props.onProdutoChange) {
              props.onProdutoChange(e.target.value);
              return;
            }
            props.setFiltros({ ...props.filtros, produto: e.target.value });
          }}
        />
        <button onClick={props.onBuscar}>filtrar</button>
        <button onClick={props.onLimpar}>limpar</button>
      </div>
    );
  },
}));

jest.mock('../components/EstoqueAtual', () => ({
  __esModule: true,
  default: (props) => (
    <div>
      <button
        onClick={() =>
          props.onPage({ first: 10, rows: 10, sortField: 'produto_referencia', sortOrder: 1 })
        }
      >
        estoque-page
      </button>
      <button onClick={() => props.verMovimentacoes({ variacao_id: 99, produto_nome: 'Produto X' })}>
        abrir-modal
      </button>
    </div>
  ),
}));

jest.mock('../components/EstoqueMovimentacoes', () => ({
  __esModule: true,
  default: (props) => (
    <div>
      <button
        onClick={() =>
          props.onPage({ first: 10, rows: 10, sortField: 'data_movimentacao', sortOrder: -1 })
        }
      >
        mov-page
      </button>
    </div>
  ),
}));

const defaultApiMock = (url, config = {}) => {
  if (url === '/depositos') return Promise.resolve({ data: [{ id: 1, nome: 'Dep 1' }] });
  if (url === '/categorias') return Promise.resolve({ data: [{ id: 2, nome: 'Cat 1' }] });

  if (url === '/fornecedores') {
    return Promise.resolve({ data: { data: [{ id: 3, nome: 'Fornecedor 1' }], meta: { total: 1 } } });
  }

  if (url === '/estoque/resumo') {
    return Promise.resolve({ data: { data: { totalProdutos: 1, totalPecas: 2, totalDepositos: 1 } } });
  }

  if (url === '/estoque/atual') {
    return Promise.resolve({ data: { data: [{ id: 11 }], meta: { total: 55 } } });
  }

  if (url === '/estoque/movimentacoes') {
    if (config?.params?.variacao) {
      return Promise.resolve({ data: { data: [{ id: 101 }], meta: { total: 20 } } });
    }
    return Promise.resolve({ data: { data: [{ id: 21 }], meta: { total: 88 } } });
  }

  return Promise.resolve({ data: { data: [], meta: { total: 0 } } });
};

const getCalls = (path) => apiEstoque.get.mock.calls.filter(([url]) => url === path);

describe('MovimentacoesEstoque', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToastShow.mockReset();
    lastFiltroProps = null;
    localStorage.clear();
    apiEstoque.get.mockImplementation(defaultApiMock);
  });

  it('carrega fornecedores com per_page paginado e parse robusto', async () => {
    render(<MovimentacoesEstoque />);

    await waitFor(() => expect(getCalls('/fornecedores').length).toBeGreaterThan(0));
    const [, config] = getCalls('/fornecedores')[0];
    expect(config.params).toMatchObject({
      per_page: 200,
      page: 1,
      order_by: 'nome',
      order_dir: 'asc',
    });

    await waitFor(() => expect(lastFiltroProps?.fornecedores?.length).toBe(1));
    expect(lastFiltroProps.fornecedores[0]).toEqual({ label: 'Fornecedor 1', value: 3 });
  });

  it('executa apenas um fetch por endpoint ao filtrar manualmente', async () => {
    render(<MovimentacoesEstoque />);
    await waitFor(() => expect(getCalls('/estoque/atual').length).toBeGreaterThan(0));

    apiEstoque.get.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'filtrar' }));

    await waitFor(() => {
      expect(getCalls('/estoque/atual')).toHaveLength(1);
      expect(getCalls('/estoque/resumo')).toHaveLength(1);
      expect(getCalls('/estoque/movimentacoes')).toHaveLength(1);
    });
  });

  it('mapeia sort_field do estoque e não refaz resumo na paginação da tabela', async () => {
    render(<MovimentacoesEstoque />);
    await waitFor(() => expect(getCalls('/estoque/atual').length).toBeGreaterThan(0));

    apiEstoque.get.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'estoque-page' }));

    await waitFor(() => expect(getCalls('/estoque/atual')).toHaveLength(1));
    const [, config] = getCalls('/estoque/atual')[0];

    expect(config.params.sort_field).toBe('referencia');
    expect(getCalls('/estoque/resumo')).toHaveLength(0);
  });

  it('aplica debounce no filtro de produto e aborta request anterior', async () => {
    render(<MovimentacoesEstoque />);
    await waitFor(() => expect(getCalls('/estoque/atual').length).toBeGreaterThan(0));

    apiEstoque.get.mockClear();
    let estoqueAtualCall = 0;
    apiEstoque.get.mockImplementation((url, config = {}) => {
      if (url === '/depositos' || url === '/categorias') return Promise.resolve({ data: [] });
      if (url === '/fornecedores') return Promise.resolve({ data: { data: [] } });
      if (url === '/estoque/resumo') return Promise.resolve({ data: { data: {} } });
      if (url === '/estoque/movimentacoes') {
        return Promise.resolve({ data: { data: [], meta: { total: 0 } } });
      }
      if (url === '/estoque/atual') {
        estoqueAtualCall += 1;
        if (estoqueAtualCall === 1) {
          return new Promise((resolve) => {
            config.signal?.addEventListener('abort', () => {
              resolve({ data: { data: [], meta: { total: 0 } } });
            });
          });
        }
        return Promise.resolve({ data: { data: [], meta: { total: 0 } } });
      }
      return Promise.resolve({ data: {} });
    });

    const input = screen.getByLabelText('produto');

    fireEvent.change(input, { target: { value: 'abcd' } });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 450));
    });

    expect(getCalls('/estoque/atual')).toHaveLength(1);
    const firstSignal = getCalls('/estoque/atual')[0][1].signal;

    fireEvent.change(input, { target: { value: 'abcde' } });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 450));
    });

    expect(getCalls('/estoque/atual')).toHaveLength(2);
    const secondSignal = getCalls('/estoque/atual')[1][1].signal;

    expect(firstSignal.aborted).toBe(true);
    expect(secondSignal.aborted).toBe(false);
  });

  it('faz paginação real no modal de movimentações por produto', async () => {
    render(<MovimentacoesEstoque />);
    await waitFor(() => expect(getCalls('/estoque/movimentacoes').length).toBeGreaterThan(0));

    apiEstoque.get.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'abrir-modal' }));

    await waitFor(() => expect(getCalls('/estoque/movimentacoes')).toHaveLength(1));
    expect(getCalls('/estoque/movimentacoes')[0][1].params).toMatchObject({
      variacao: 99,
      page: 1,
      per_page: 10,
    });

    const dialog = await screen.findByTestId('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'mov-page' }));

    await waitFor(() => expect(getCalls('/estoque/movimentacoes')).toHaveLength(2));
    expect(getCalls('/estoque/movimentacoes')[1][1].params).toMatchObject({
      variacao: 99,
      page: 2,
      per_page: 10,
    });
  });
});
