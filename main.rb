require 'rubygems'
require 'bundler/setup'
require 'uuid'
require 'aws-sdk-sqs'

sqs = Aws::SQS::Client.new(region: 'eu-north-1')
$my_queue = ''

def list_queue_urls(sqs_client)
  queues = sqs_client.list_queues

  $my_queue = queues.queue_urls[0]
  queues.queue_urls.each do |url|
    puts url
  end
rescue StandardError => e
  puts "Error while listing Queues: #{e.message}"
end

def send_message(sqs_client)
  sqs_client.send_message(
    queue_url: $my_queue,
    message_body: "Hello from Ruby!"
  )

rescue StandardError => e
  puts "Error while sending message: #{e.message}"
end

def receive_message(sqs_client)
  response = sqs_client.receive_message(
    queue_url: $my_queue,
    max_number_of_messages: 2
  )

  if response.messages.count.zero?
    puts 'No messages to receive, or all messages have already ' \
           'been previously received.'
    return
  end

  response.messages[0].body
end

list_queue_urls(sqs)
send_message(sqs)
puts receive_message(sqs)
