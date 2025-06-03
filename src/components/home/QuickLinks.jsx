import React from 'react';
import { Card } from 'primereact/card';
import {PERFIS} from "../../constants/perfis";

const QuickLinks = ({ hasPermission, navigate, perfil }) => {
  const atalhosComuns = [
    { label: 'Pedidos', route: '/pedidos', permissao: 'pedidos.visualizar', icon: 'pi pi-dollar' },
    { label: 'Catálogo de Produtos', route: '/catalogo', permissao: 'produtos.catalogo', icon: 'pi pi-box' }
  ];

  const atalhosAdmin = [
    { label: 'Estoque', route: '/depositos', permissao: 'depositos.visualizar', icon: 'pi pi-inbox' },
    { label: 'Usuários', route: '/usuarios', permissao: 'usuarios.visualizar', icon: 'pi pi-users' },
    { label: 'Relatórios', route: '/relatorios', permissao: 'relatorios.visualizar', icon: 'pi pi-chart-bar' }
  ];

  const atalhos = perfil === PERFIS.ADMINISTRADOR.slug ? [...atalhosComuns, ...atalhosAdmin] : atalhosComuns;

  return (
    <div className="grid mb-4">
      {atalhos.map((item, index) => (
        hasPermission(item.permissao) && (
          <div key={index} className="col-12 md:col-4">
            <Card
              title={item.label}
              className="surface-card shadow-2 border-round cursor-pointer hover:shadow-4"
              onClick={() => navigate(item.route)}
            >
              <div className="flex align-items-center gap-2 text-primary">
                <i className={`${item.icon}`}></i>
                <span>Acessar {item.label}</span>
              </div>
            </Card>
          </div>
        )
      ))}
    </div>
  );
};

export default QuickLinks;
