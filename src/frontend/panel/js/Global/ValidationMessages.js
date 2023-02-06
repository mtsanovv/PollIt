class ValidationMessages {
    static USERNAME_INPUT_MIN_LENGTH_NOT_MET = this.getMinimumLengthMessage(ValidationConstants.USERNAME_INPUT_MIN_LENGTH);
    static USERNAME_INPUT_REGEX_REQUIREMENT_NOT_MET = 'Only letters, numbers and underscores are allowed';

    static PASSWORD_INPUT_MIN_LENGTH_NOT_MET = this.getMinimumLengthMessage(ValidationConstants.PASSWORD_INPUT_MIN_LENGTH);
    static PASSWORD_INPUT_REGEX_REQUIREMENT_NOT_MET = 'Whitespaces are not allowed';

    static DISPLAY_NAME_INPUT_MIN_LENGTH_NOT_MET = this.getMinimumLengthMessage(ValidationConstants.DISPLAY_NAME_INPUT_MIN_LENGTH);

    static POLL_TITLE_INPUT_MIN_LENGTH_NOT_MET = this.getMinimumLengthMessage(ValidationConstants.POLL_TITLE_INPUT_MIN_LENGTH);

    static POLL_THRESHOLD_INPUT_REGEX_REQUIREMENT_NOT_MET = 'Only digits 0-9 are allowed';
    static POLL_THRESHOLD_INPUT_RANGE_NOT_MET = 'The number should be between ' + ValidationConstants.POLL_THRESHOLD_INPUT_MIN_VALUE + ' and ' + ValidationConstants.POLL_THRESHOLD_INPUT_MAX_VALUE;

    static POLL_OPTION_INPUT_EMPTY = 'Required';
    static POLL_OPTION_INPUT_NOT_UNIQUE = 'This option already exists';

    static PASSWORD_CONFIRMATION_DOES_NOT_MATCH_THE_PASSWORD = 'The passwords do not match';

    static CONNECTION_ERROR = 'The "' + Config.AGENCY_NAME + '" panel is currently unavailable, try again later';
    static UNEXPECTED_SERVER_RESPONSE = 'Unexpected response from the server';

    static ERROR_WHILE_DELETING_USER_PREFIX = "An error has occurred while deleting the user '";
    static ERROR_WHILE_DELETING_POLL = 'An error has occurred while deleting this poll';

    static getMinimumLengthMessage(iMinLength) {
        return 'At least ' + iMinLength + ' characters are required';
    }
}