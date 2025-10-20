export interface EmailTemplate {
    subject: string;
    html: string;
    text?: string;
}
export interface EmailData {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    html?: string;
    text?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
    }>;
}
export declare class EmailService {
    private transporter;
    constructor();
    private verifyConnection;
    sendEmail(emailData: EmailData): Promise<boolean>;
    sendBulkEmails(emails: EmailData[]): Promise<{
        success: number;
        failed: number;
    }>;
    sendLorryRequestNotification(adminEmail: string, managerName: string, requestDetails: {
        id: string;
        requiredDate: string;
        purpose: string;
        priority: string;
        location?: string;
    }): Promise<boolean>;
    sendLorryApprovalNotification(managerEmail: string, lorryDetails: {
        requestId: string;
        lorryName: string;
        licensePlate: string;
        approvedBy: string;
    }): Promise<boolean>;
    sendPaymentNotification(farmerEmail: string, paymentDetails: {
        farmerName: string;
        amount: number;
        deliveryDate: string;
        referenceNumber: string;
    }): Promise<boolean>;
    sendAdvancePaymentNotification(farmerEmail: string, advanceDetails: {
        farmerName: string;
        amount: number;
        paymentDate: string;
        referenceNumber?: string;
        reason?: string;
    }): Promise<boolean>;
    sendDeliveryCompletionNotification(emails: string[], deliveryDetails: {
        farmerName: string;
        deliveryDate: string;
        netWeight: number;
        totalValue: number;
        lorryName: string;
    }): Promise<boolean>;
    private generateLorryRequestTemplate;
    private generateLorryApprovalTemplate;
    private generatePaymentTemplate;
    private generateAdvancePaymentTemplate;
    private generateDeliveryCompletionTemplate;
}
export default EmailService;
//# sourceMappingURL=emailService.d.ts.map