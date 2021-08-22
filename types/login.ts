type Votes = {
    selected: number,
    name: string
}
export type LoginResult = {
    term: "1/2564";
    stdID: string;
    stdNo: string;
    stdName: string;
    stdClass: string;
    promptID: true;
    votes?: Votes
};