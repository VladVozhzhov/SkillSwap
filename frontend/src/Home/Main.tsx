import React from 'react'
import { Link } from 'react-router-dom'
import { Handshake, BookOpenCheck, Users } from 'lucide-react';

const features = [
  {
    icon: <Handshake className="w-8 h-8 text-purple-700" />,
    title: 'Skill Exchange',
    description: 'Swap your skills with others—no money, just mutual learning.',
  },
  {
    icon: <BookOpenCheck className="w-8 h-8 text-purple-700" />,
    title: 'Learn Anything',
    description: 'From coding to cooking, find someone to teach what you want to learn.',
  },
  {
    icon: <Users className="w-8 h-8 text-purple-700" />,
    title: 'Community Driven',
    description: 'Join a supportive network of learners, creators, and mentors.',
  },
]

const Main: React.FC = () => {
  return (
    <main className="text-center px-6 py-12 max-w-5xl mx-auto">
      <h2 className="text-4xl text-white font-bold">About us</h2>
      <section id='about' className="text-white px-6 max-w-4xl mx-auto my-12">
        <p className="text-xl mb-6 leading-relaxed">
            SkillSwap is a community-driven platform where people connect to share, teach, and learn skills from one another. Whether you're a developer, designer, musician, writer, or anything in between — there's someone out there who wants to learn what you know, and someone else who can teach you something new.
        </p>
        <p className="text-xl mb-4">
            Our mission is to make learning collaborative, affordable, and social. Instead of traditional transactions, we focus on mutual exchange — you help someone grow, and someone helps you in return.
        </p>
        <p className="text-xl">
            Join today to explore skill swaps, meet talented people from around the world, and start growing together.
        </p>
      </section>

      <Link
        to='/register'
        className="bg-white text-2xl text-[#003153] font-semibold py-2 px-4 rounded-lg shadow hover:bg-gray-100 active:bg-gray-200 transition duration-75"
      >
        Start Swapping your skills
      </Link>

      <section className="bg-gray-100 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#003153] mb-8">Why Use SkillSwap?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-lg text-[#003153] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Main
