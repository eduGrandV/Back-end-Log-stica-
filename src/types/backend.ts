
export interface Filial {
    nome: string;
    secoes: any[]; 
}


export type PermissaoNivel = 'master' | 'empresa' | 'setor';


export interface AuthUser {
    id: string;
    permissao_nivel: PermissaoNivel;
    entidade_restrita_id: string | null; 
}


export interface UploadPayload {
    entidadeId: string;
    nomeCampanha: string;
    filiais: Filial[]; 
}