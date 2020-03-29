import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import Company from '../models/Company';

import authConfig from '../../config/auth';

class SessionCompanyController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email, password } = req.body;

    const company = await Company.findOne({ where: { email } });

    if (!company) {
      return res.status(401).json({ error: 'Company not found' });
    }

    if (!(await company.checkPassword(password))) {
      return res.status(401).json({ error: 'Passord does not match' });
    }

    const { id, name } = company;

    return res.json({
      company: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionCompanyController();
