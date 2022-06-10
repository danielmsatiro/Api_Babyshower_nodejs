import { Request, Response } from "express"
import { AppError, handleError } from "../../errors/appError"
import adminstradorRegisterService from "../../services/administrators/administratorsRegister.service"

const adminstradorRegisterController = async (req: Request, res: Response) => {
    try {
        const {username, email, password} = req.body

        const newAdmin = await adminstradorRegisterService({username, email, password})

        return res.status(201).json(newAdmin)
        
    } catch (error) {

        if (error instanceof AppError) {
            handleError(error, res);
          }
        
    }
}

export default adminstradorRegisterController