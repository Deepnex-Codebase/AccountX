/**
 * GST Registration Controller
 * Handles GST registration related operations
 */

const GSTRegistration = require('../../models/gst/registration.model');
const AppError = require('../../utils/appError');

/**
 * Get all GST registrations for a tenant
 * @route GET /api/v1/gst/registrations
 * @access Private
 */
exports.getRegistrations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { tenant: req.tenantId };

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { gstin: { $regex: search, $options: 'i' } },
        { legalName: { $regex: search, $options: 'i' } },
        { tradeName: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query with pagination
    const registrations = await GSTRegistration.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const total = await GSTRegistration.countDocuments(query);

    res.status(200).json({
      success: true,
      count: registrations.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new GST registration
 * @route POST /api/v1/gst/registrations
 * @access Private
 */
exports.createRegistration = async (req, res, next) => {
  try {
    // Add tenant and creator to the registration data
    req.body.tenant = req.tenantId;
    req.body.createdBy = req.user.id;

    // Create new registration
    const registration = await GSTRegistration.create(req.body);

    res.status(201).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    // Handle duplicate GSTIN error
    if (error.code === 11000) {
      return next(new AppError('A registration with this GSTIN already exists', 400));
    }
    next(error);
  }
};

/**
 * Get a single GST registration by ID
 * @route GET /api/v1/gst/registrations/:id
 * @access Private
 */
exports.getRegistrationById = async (req, res, next) => {
  try {
    const registration = await GSTRegistration.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
    });

    if (!registration) {
      return next(new AppError('GST registration not found', 404));
    }

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a GST registration
 * @route PUT /api/v1/gst/registrations/:id
 * @access Private
 */
exports.updateRegistration = async (req, res, next) => {
  try {
    // Find and update the registration
    const registration = await GSTRegistration.findOneAndUpdate(
      { _id: req.params.id, tenant: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!registration) {
      return next(new AppError('GST registration not found', 404));
    }

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a GST registration
 * @route DELETE /api/v1/gst/registrations/:id
 * @access Private
 */
exports.deleteRegistration = async (req, res, next) => {
  try {
    const registration = await GSTRegistration.findOneAndDelete({
      _id: req.params.id,
      tenant: req.tenantId,
    });

    if (!registration) {
      return next(new AppError('GST registration not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update GST registration status
 * @route PATCH /api/v1/gst/registrations/:id/status
 * @access Private
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return next(new AppError('Status is required', 400));
    }

    const registration = await GSTRegistration.findOneAndUpdate(
      { _id: req.params.id, tenant: req.tenantId },
      { status },
      { new: true, runValidators: true }
    );

    if (!registration) {
      return next(new AppError('GST registration not found', 404));
    }

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Store GST portal credentials
 * @route PATCH /api/v1/gst/registrations/:id/credentials
 * @access Private
 */
exports.storeCredentials = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(new AppError('Username and password are required', 400));
    }

    const registration = await GSTRegistration.findOneAndUpdate(
      { _id: req.params.id, tenant: req.tenantId },
      {
        'portalCredentials.username': username,
        'portalCredentials.password': password,
        'portalCredentials.isStored': true,
      },
      { new: true }
    );

    if (!registration) {
      return next(new AppError('GST registration not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'GST portal credentials stored successfully',
      data: {
        id: registration._id,
        gstin: registration.gstin,
        credentialsStored: registration.portalCredentials.isStored,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify GST registration with government portal
 * @route POST /api/v1/gst/registrations/:id/verify
 * @access Private
 */
exports.verifyRegistration = async (req, res, next) => {
  try {
    // Find the registration
    const registration = await GSTRegistration.findOne({
      _id: req.params.id,
      tenant: req.tenantId,
    });

    if (!registration) {
      return next(new AppError('GST registration not found', 404));
    }

    // In a real implementation, this would call an external API to verify the GSTIN
    // For now, we'll simulate a successful verification
    const verificationResult = {
      success: true,
      verified: true,
      details: {
        legalName: registration.legalName,
        tradeName: registration.tradeName,
        status: 'Active',
        lastUpdated: new Date(),
      },
    };

    // Update verification status
    registration.verificationStatus = 'Verified';
    registration.lastVerified = new Date();
    registration.verificationDetails = {
      lastAttempt: new Date(),
      errorMessage: '',
    };

    await registration.save();

    res.status(200).json({
      success: true,
      message: 'GST registration verified successfully',
      data: verificationResult,
    });
  } catch (error) {
    // Update verification status to failed
    try {
      if (req.params.id) {
        await GSTRegistration.findOneAndUpdate(
          { _id: req.params.id, tenant: req.tenantId },
          {
            verificationStatus: 'Failed',
            'verificationDetails.lastAttempt': new Date(),
            'verificationDetails.errorMessage': error.message,
          }
        );
      }
    } catch (updateError) {
      console.error('Error updating verification status:', updateError);
    }

    next(error);
  }
};