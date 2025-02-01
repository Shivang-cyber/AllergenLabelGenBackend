const catchAsync = (fn) => {
    const errorHandller = (req, res, next) => {
        fn(req, res, next).catch(next);
    }
    return errorHandller
}

module.exports = catchAsync;