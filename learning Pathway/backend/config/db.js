const mongoose = require('mongoose');
const Category = require('../models/Category');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    await initializeCategories();
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const initializeCategories = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      const categories = [
        {
          //1
          name: "Computer Science Fundamentals",
          description: "Core computer science concepts and principles",
          engineeringField: "Computer Science",
          level: "beginner",
          topics: ["Algorithms", "Data Structures", "Programming Basics","Computer Architecture","Operating System","Networking","Database"],
          recommendedDuration: 4,
          videoResources: [
            {
              title: "Introduction to Programming",
              url: "https://youtu.be/zOjov-2OZ0E?si=ITc76aFhux6IKUxf",
              description: "Learn programming basics",
            },
            {
              title: "Data Structures Explained",
              url: "https://youtu.be/8hly31xKli0?si=uLzOZ1Hs7mMyBpWP",
              description: "Understanding data structures",
            },
          ],
        },
        {
          //2
          name: "Advanced Programming Concepts",
          description: "Advanced programming and software design",
          engineeringField: "Computer Science",
          level: "intermediate",
          topics: ["Object-Oriented Programming", "Design Patterns"],
          recommendedDuration: 6,
          videoResources: [
            {
              title: "Object-Oriented Programming",
              url: "https://youtu.be/zOjov-2OZ0E?si=dCihK3Z9Ipn-EbHE",
              description: "Learn OOP concepts",
            },
          ],
        },
        {
          //3
          name: "Advanced Web Development",
          description:
            "Advanced concepts in web development, including frontend and backend technologies.",
          engineeringField: "Computer Science",
          level: "intermediate",
          topics: [
            "Frontend Frameworks",
            "Backend Development",
            "Web Security",
            "Performance Optimization",
          ],
          recommendedDuration: 8,
          videoResources: [
            {
              title: "Modern Web Development",
              url: "https://youtu.be/nu_pCVPKzTk?si=nMjaacqTpmy0iVMC",
              description:
                "Learn modern web development with React and Node.js",
            },
          ],
        },
        {
          //4
          name: "Android Development",
          description: "Comprehensive guide to Android app development using Kotlin and Jetpack.",
          engineeringField: "Computer Science",
          level: "intermediate",
          topics: ["Kotlin Programming","Java Programming", "Jetpack Components", "Android Security", "Performance Optimization"],
          recommendedDuration: 7,
          videoResources: [
            {
              title: "Android Development with Kotlin",
              url: "https://youtu.be/u64gyCdqawU?si=gm-8R5LJqS5k76L0",
              description: "Build modern Android applications with Java, Kotlin and Jetpack",
            },
          ],
        },
        {
          //5
          name: "Data Science",
          description: "Explore advanced data science techniques, machine learning, and AI applications.",
          engineeringField: "Computer Science",
          level: "expert",
          topics: ["Machine Learning", "Deep Learning", "Big Data Processing", "Data Engineering"],
          recommendedDuration: 10,
          videoResources: [
            {
              title: "Machine Learning & AI",
              url: "https://youtu.be/ua-CiDNNj30?si=PCEWPxhreSnxgugq",
              description: "Learn advanced machine learning and deep learning techniques",
            },
          ],
        },
        {
          //6
          name: "Cloud Computing",
          description: "Deep dive into cloud platforms, serverless computing, and DevOps practices.",
          engineeringField: "Computer Science",
          level: "intermediate",
          topics: ["AWS & Azure", "Serverless Architecture", "Cloud Security", "Kubernetes"],
          recommendedDuration: 9,
          videoResources: [
            {
              title: "Cloud Computing Fudamentals",
              url: "https://youtu.be/EN4fEbcFZ_E?si=yKSzzKlJvkhKEnZ5",
              description: "Learn cloud computing with AWS, Azure, and Google Cloud",
            },
          ],
        },
        // Add more categories as needed
      ];

      await Category.insertMany(categories);
      console.log('Categories initialized with video resources');
    }
  } catch (error) {
    console.error('Error initializing categories:', error);
  }
};

module.exports = connectDB; 