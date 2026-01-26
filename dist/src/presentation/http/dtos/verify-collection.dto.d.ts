export declare enum VerificationAction {
    VERIFY = "VERIFIED",
    REJECT = "REJECTED",
    DISPUTE = "DISPUTED"
}
export declare class VerifyCollectionDto {
    status: VerificationAction;
    notes?: string;
    signature: string;
}
