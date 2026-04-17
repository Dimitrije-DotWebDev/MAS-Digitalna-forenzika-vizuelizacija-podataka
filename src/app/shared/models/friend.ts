export interface Friend{
    id: string;
    username: string;
    since: string;
    age: number;
    occupation: string;
    gender: 'Male' | 'Female' | 'Other'; 
    location: {
        city: string;
        country: string;
    };
}