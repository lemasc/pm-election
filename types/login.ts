type Votes = {
    selected: number,
    name: string
}

export type LoginForm = {
    stdID: string;
    stdIDCard: string;
    captcha?: string;
    haction?: "register_step1";
  };

export type LoginResult = {
    /**
     * @deprecated This field is for refencing only and should not be used.
     */
    term?: "1/2564";
    stdID: string;
    stdNo: string;
    stdName: string;
    stdClass: string;
    votes?: Votes
};

export type VotesData = LoginResult & Votes & {
    ip: string,
    useragent: string
    timestamp?: Date,
    uid: string
}