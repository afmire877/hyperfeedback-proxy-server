import { NextFunction, Request, Response } from 'express';
import path from 'path/posix';
import isUUID from '../utils/isUUID';

const checkValidSubdomain = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const [pid, proxyType] = req.subdomains.reverse();
  if (!isUUID(pid) || proxyType !== 'p') {
    res.sendFile(path.resolve(__dirname, '../../public/404.html'));
  }

  next();
};

export default checkValidSubdomain;
