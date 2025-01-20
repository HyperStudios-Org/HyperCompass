
export default interface commandInterface {
    readonly execution?: {
        data: {
            name: string;
            description: string;
        };
        execution: {
            security: {
                guild_only?: boolean;
                owner_only?: boolean;
                staff_only?: boolean;
                hyper_only?: boolean;
            };
            user_permission?: string[];
        };
    }

}
