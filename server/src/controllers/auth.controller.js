import * as authService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/api-response.js';

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;
    const result = await authService.registerUser({ fullName, email, password, role });
    return sendSuccess(res, result, 'Registration successful', 201);
  } catch (err) {
    if (err.message.includes('already exists')) {
      return sendError(res, err.message, 409, 'USER_EXISTS');
    }
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    return sendSuccess(res, result, 'Login successful');
  } catch (err) {
    return sendError(res, err.message, 401, 'INVALID_CREDENTIALS');
  }
};

export const logout = async (req, res) => {
  return sendSuccess(res, null, 'Logged out successfully');
};

export const getMe = async (req, res, next) => {
  try {
    const profile = await authService.getProfileById(req.user.id);
    if (!profile) {
      return sendError(res, 'User profile not found', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, profile, 'Profile fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await authService.updateProfileById(req.user.id, req.body);
    return sendSuccess(res, updated, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

