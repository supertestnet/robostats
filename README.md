# Robostats
A page that counts various statistics about the usage of robosats

I made this because a few months before switching to the federated model whoever was running https://learn.robosats.com/stats/ stopped updating it, and I miss these stats

Here are some notes on the problems I had to overcome while making it.

# Sourcing the data

My initial source for data was the aforementioned stats site -- the one that doesn't update anymore. I started by copying their 0 day data and the data from the last day they updated, and those data points became my starting data points.

For more recent data, I had a few problems:

(1) robosats uses a "federated" model now where usage is split up across four folks who are operating the backend, so I can't just query one source of data anymore, I have to query all four and then add their data together -- but adding is easy to do so nbd.

(2) robosats is availably only via tor, and I usually try to avoid writing things that require me to run a server. Servers cost money and I have trouble maintaining them, eventually whatever I put on a server seems to stop running because I stopped paying for the server. But I did find a service that rents vps's at a monthly rate of only $3, so I decided to give it a whirl.

# Two apps I wrote

I wrote a pair of python & nodejs apps that run once per day and which I'm hosting on that $3-per-month vps. The python app is based on my old tortalker software but I generalized it: a clearnet-only app can talk to my python app, and pass it any onion address with an api key to prevent people from spamming it. My python app will retrieve that address's contents over tor and return the results over clearnet.

My nodejs app just passes every robosats operator's tor domain to my python app and basically asks it to query for their api info, which lists stuff like how many contracts they processed today, how many btcs they handled, and the cumulative total they've handled over their lifetime. When it gets the results it sums this info, broadcasts a note to nostr saying what the latest data is, and then sleeps for 24 hours before running again.

# IPv6 problem

The vps I'm using (skhron.com.ua) only supports ipv6, not ipv4. This means it can't "talk to" legacy websites -- only ones which resolve to an ipv6 address. At this point that means it can talk to most websites, but I found it had lots of trouble talking to nostr relays! None of the ones I usually use have an ipv6 address. But I found this list of relays and just went through them one by one, using this tool to check if they had an ipv6 address. Eventually I found that this relay does: junxingwang.org -- so that's the nostr relay I'm using for this project.

# Wrapping up

Now that I have a source that publishes the latest robosats stats every day it was easy! I made a little webpage that uses nostr to grab all events from my little bot, and I hard coded in the original info from learn.robosats.com/stats as a "starting point" for my charts. So now the charts pick up where the old site left off, and I did some averaging/guessing to "fill in the gap" between July of last year and now. These averages also produce a weird super-straight line so I added in some randomness that makes the line look more natural. Eventually, when I have enough of my own data, I will probably eliminate that noise, but for now it helps.

Voila! A new robosats tracker that you can point to as evidence that at least one darknet market on the lightning network has meaningful usage. I wonder how to find out if it is used more than most monero-based darkmarkets. 🤔
