import { authService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { LoginInput, RegistroInput } from '../validators/auth.validator';

/** POST /api/auth/register */
export const registrar = asyncHandler(async (req, res) => {
  const data = req.body as RegistroInput;
  const resultado = await authService.registrar(data);
  res.status(201).json({ data: resultado });
});

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
  const data = req.body as LoginInput;
  const resultado = await authService.login(data);
  res.json({ data: resultado });
});
