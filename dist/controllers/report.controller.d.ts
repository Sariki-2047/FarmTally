import { Request, Response } from 'express';
export declare class ReportController {
    static generateFarmerReport(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static generateFarmerReportText(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getLorryReports(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getAllReports(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getReportById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=report.controller.d.ts.map