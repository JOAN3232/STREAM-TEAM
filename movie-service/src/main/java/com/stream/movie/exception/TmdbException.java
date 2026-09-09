package com.stream.movie.exception;

import org.springframework.http.HttpStatus;

public class TmdbException extends ApiException {

    public TmdbException(String message) {
        super(HttpStatus.BAD_GATEWAY, message);
    }

    public TmdbException(String message, Throwable cause) {
        super(HttpStatus.BAD_GATEWAY, message, cause);
    }
}
