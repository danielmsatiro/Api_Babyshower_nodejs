export interface ICompany {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  razaoSocial: string;
  cnpj: string;
  phone?: string;
  imageLogo?: string;
}

export interface ICompanyLogin {
  username: string;
  email: string;
  password: string;
  razaoSocial: string;
  cnpj: string;
  phone?: string;
  imageLogo?: string;
}

export interface ICompanyRegister {
  username: string;
  email: string;
  password: string;
  razaoSocial: string;
  cnpj: string;
  phone?: string;
  imageLogo?: string;
}
