// controllers/supportTicketController.js
import SupportTicket from '../models/SupportTicket.js';

// Create support ticket
export const createSupportTicket = async (req, res) => {
  try {
    const { name, email, subject, category, priority, description } = req.body;
    
    // Validate required fields
    if (!subject || !category || !priority || !description) {
      return res.status(400).json({
        success: false,
        message: 'Subject, category, priority, and description are required'
      });
    }

    let customerName, customerEmail;

    // If user is authenticated, use their info from auth context
    if (req.user) {
      customerName = req.user.name;
      customerEmail = req.user.email;
      console.log('Authenticated user creating ticket:', { name: customerName, email: customerEmail });
    } else {
      // For non-authenticated users, use form data
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Name and email are required for guest users'
        });
      }
      customerName = name;
      customerEmail = email;
      console.log('Guest user creating ticket:', { name: customerName, email: customerEmail });
    }

    const ticketData = {
      customerName,
      customerEmail,
      subject,
      category,
      priority,
      description
    };

    const ticket = new SupportTicket(ticketData);
    await ticket.save();
    
    console.log('Support ticket created successfully:', ticket._id);
    
    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      ticket: {
        _id: ticket._id,
        customerName: ticket.customerName,
        customerEmail: ticket.customerEmail,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's tickets (by email if authenticated)
export const getUserTickets = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { page = 1, limit = 10, status, category, priority } = req.query;
    
    let query = { customerEmail: req.user.email };
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (priority && priority !== 'all') query.priority = priority;
    
    console.log('Fetching tickets for user:', req.user.email);
    console.log('Query:', query);
    
    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    console.log('Found tickets:', tickets.length);
    
    const total = await SupportTicket.countDocuments(query);
    
    res.json({
      success: true,
      tickets,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error in getUserTickets:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all tickets (Admin)
export const getAllTickets = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { page = 1, limit = 100, status, category, priority, search } = req.query;
    
    let query = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (priority && priority !== 'all') query.priority = priority;
    
    if (search && search.trim()) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('Admin fetching tickets with query:', query);
    
    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await SupportTicket.countDocuments(query);
    
    console.log('Found tickets:', tickets.length);
    
    res.json({
      success: true,
      tickets,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error in getAllTickets:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single ticket
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const ticket = await SupportTicket.findById(id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    // Check if user is authorized to view this ticket (if not admin)
    if (req.user.role !== 'admin' && ticket.customerEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this ticket'
      });
    }
    
    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Error getting ticket:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update ticket (Admin)
export const updateTicket = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { id } = req.params;
    const { status, adminReply } = req.body;
    
    const ticket = await SupportTicket.findById(id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    if (status) {
      ticket.status = status;
    }
    
    if (adminReply && adminReply.trim()) {
      const reply = {
        message: adminReply.trim(),
        author: req.user.name || req.user.email,
        authorType: 'admin',
        createdAt: new Date()
      };
      
      ticket.replies.push(reply);
      ticket.lastReplyAt = new Date();
    }
    
    await ticket.save();
    
    res.json({
      success: true,
      message: 'Support ticket updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Add reply to ticket
export const addReplyToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }
    
    const ticket = await SupportTicket.findById(id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    // Check if user is authorized to reply to this ticket
    const isAdmin = req.user.role === 'admin';
    const isTicketOwner = ticket.customerEmail === req.user.email;
    
    if (!isAdmin && !isTicketOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reply to this ticket'
      });
    }
    
    const reply = {
      message: message.trim(),
      author: req.user.name || req.user.email,
      authorType: isAdmin ? 'admin' : 'user',
      createdAt: new Date()
    };
    
    ticket.replies.push(reply);
    ticket.lastReplyAt = new Date();
    
    // If user replied to a closed ticket, reopen it
    if (!isAdmin && ticket.status === 'closed') {
      ticket.status = 'open';
    }
    
    await ticket.save();
    
    res.json({
      success: true,
      message: 'Reply added successfully',
      ticket
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete ticket (Admin only)
export const deleteTicket = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const { id } = req.params;
    
    const ticket = await SupportTicket.findByIdAndDelete(id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Support ticket deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get ticket stats (Admin)
export const getTicketStats = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const totalTickets = await SupportTicket.countDocuments();
    
    const statusStats = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const categoryStats = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const priorityStats = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const openTickets = await SupportTicket.countDocuments({ status: 'open' });
    const inProgressTickets = await SupportTicket.countDocuments({ status: 'in-progress' });
    const resolvedTickets = await SupportTicket.countDocuments({ status: 'resolved' });
    const closedTickets = await SupportTicket.countDocuments({ status: 'closed' });
    
    // Recent tickets (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentTickets = await SupportTicket.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    res.json({
      success: true,
      stats: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        recentTickets,
        statusBreakdown: statusStats,
        categoryBreakdown: categoryStats,
        priorityBreakdown: priorityStats
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};