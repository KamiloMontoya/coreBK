// @import_dependencies_node Import libraries
import { Request, Response, NextFunction } from 'express';
// @end

// @import_utilities Import utilities
import { responseUtility } from "@scnode_core/utilities/responseUtility";
import { jwtUtility } from '@scnode_core/utilities/jwtUtility';
import { i18nUtility } from '@scnode_core/utilities/i18nUtility'
// @end

class AuthenticatedMiddleware {

  /*===============================================
  =            Estructura de un metodo            =
  ================================================
    //La estructura de un metodo debe ser la siguiente:
    public methodName = (req: Request, res: Response, next: NextFunction) => {
        next();
    }
  /*======  End of Estructura de un metodo  =====*/

  constructor () {}

  /**
   * Metodo que permite validar la autenticidad de un token JWT y conceder o denegar acceso al sistema
   * @param req Objeto de clase Express
   * @param res Objeto de clase Express
   * @param next Objeto de clase Express
   * @returns
   */
  public ensureAuth = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      return responseUtility.buildResponseFailed('http',res,{error_key: 'jwt.unauthorized_header'})
    }

    const token = req.headers.authorization.replace(/['"]+/g,'');

    try {
      const refresh_token = (req.headers["refresh-token"]) ? true : false;

      const payload = jwtUtility.jwtDecode(token,jwtUtility.getJwtSecret(req));
      req.user = payload;

      if (payload.locale) {
        i18nUtility.setLocale(payload.locale);
      }

      await this.processCustomToken(payload)

      res.token = token;

      if (refresh_token === true) {
        res.token = jwtUtility.refreshToken(token,jwtUtility.getJwtSecret(req));
      }

      next();

    } catch (e) {
      if (e.message == 'Token expired') {
          return responseUtility.buildResponseFailed('http',res,{error_key: 'jwt.token_expired'})
      } else {
          return responseUtility.buildResponseFailed('http',res,{error_key: 'jwt.token_invalid'})
      }
    }
  }

  /**
   * Metodo que permite procesar funcionamiento extra para el token cuando este fue validado por el sistema
   * @param payload Información del token
   */
  public processCustomToken = async (payload) => {}
}

export const authenticatedMiddleware = new AuthenticatedMiddleware();
export { AuthenticatedMiddleware }
