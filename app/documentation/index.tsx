import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/lib/hooks/useThemeColor';
import { verticalScale, moderateScale } from '@/lib/utilities/Metrics';

export default function EventDocumentationScreen() {
    const sectionBackground = useThemeColor({}, 'sectionBackground');
  
    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        contentContainer: {
            padding: moderateScale(16),
            paddingBottom: verticalScale(40),
        },
        mainSection: {
            backgroundColor: sectionBackground,
            borderRadius: moderateScale(14),
            marginBottom: verticalScale(16),
        },
        section: {
            padding: moderateScale(16),
            borderRadius: moderateScale(8),
            overflow: 'hidden',
        },
        title: {
            fontSize: moderateScale(24),
            fontWeight: 'bold',
            marginBottom: verticalScale(8),
        },
        subtitle: {
            fontSize: moderateScale(20),
            fontWeight: 'bold',
            marginTop: verticalScale(16),
            marginBottom: verticalScale(8),
        },
        sectionTitle: {
            fontSize: moderateScale(18),
            fontWeight: '600',
            marginTop: verticalScale(12),
            marginBottom: verticalScale(8),
        },
        description: {
            fontSize: moderateScale(16),
            lineHeight: moderateScale(24),
            marginBottom: verticalScale(16),
        },
        bullet: {
            fontSize: moderateScale(16),
            lineHeight: moderateScale(24),
            marginBottom: verticalScale(8),
            paddingLeft: moderateScale(8),
        },
        bold: {
            fontWeight: '600',
        },
        tipBox: {
            backgroundColor: '#f8f4e3',
            borderLeftWidth: 4,
            borderLeftColor: '#f5c33b',
            padding: moderateScale(12),
            marginVertical: verticalScale(12),
            borderRadius: moderateScale(4),
        },
        tipTitle: {
            fontSize: moderateScale(16),
            fontWeight: '600',
            marginBottom: verticalScale(8),
            color: '#70591e',
        },
        tipText: {
            fontSize: moderateScale(14),
            lineHeight: moderateScale(22),
            color: '#70591e',
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Help & Guides',
                    headerTitleStyle: { fontWeight: '600' },
                    headerBackTitle: 'Back',    
                }}
            />
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <ThemedView style={styles.mainSection}>
                    <ThemedView style={styles.section}>
                        <ThemedText style={styles.title}>Our best guide!</ThemedText>
                        
                        <ThemedText style={styles.description}>
                            Welcome to our guide on events! 
                            Here you will find an explanation of the most important aspects 
                            of using our platform and interacting with other users, as well as some useful tips.
                        </ThemedText>
                        
                        <ThemedText style={styles.subtitle}>📎 Types of Events You Can Create</ThemedText>
                        
                        <ThemedText style={styles.sectionTitle}>💡 Donation</ThemedText>
                        <ThemedText style={styles.description}>
                            A donation event is ideal when you want to support someone directly. 
                            Think of it as handing a digital envelope directly to a friend or cause you care about. 
                            The money goes directly from you to them once the conditions you specify are met. 
                            How they work will be described later.
                        </ThemedText>
                        <ThemedText style={styles.bullet}>• You'll need to specify who receives the funds</ThemedText>
                        <ThemedText style={styles.bullet}>• Money moves in one direction: from you to them</ThemedText>
                        <ThemedText style={styles.bullet}>• The recipient gets the funds once some of the conditions set are achieved</ThemedText>
                        
                        <ThemedText style={styles.sectionTitle}>💡 Fundraising</ThemedText>
                        <ThemedText style={styles.description}>
                            Fundraising is your go-to when you want to gather support from multiple people for a single cause. 
                            Like a digital fundraiser, it allows many contributors to pool their resources toward one recipient, 
                            whether it's for a charity, a friend's medical bills, or a community project.
                        </ThemedText>
                        <ThemedText style={styles.bullet}>• You'll need to specify who receives the collected funds</ThemedText>
                        <ThemedText style={styles.bullet}>• Multiple people can contribute to the same cause</ThemedText>
                        <ThemedText style={styles.bullet}>• All funds go to the designated recipient when some of the conditions set are achieved</ThemedText>
                        
                        <ThemedText style={styles.sectionTitle}>💡 Jackpot</ThemedText>
                        <ThemedText style={styles.description}>
                            Jackpot events add a bit of excitement! Everyone contributes to a common pool, and the winner 
                            is determined partly based on chance and partly on your share of the pot's total bank. It's like a friendly competition where participants 
                            have a chance to win the collected full bank.
                        </ThemedText>
                        <ThemedText style={styles.bullet}>• No need to specify a recipient in advance</ThemedText>
                        <ThemedText style={styles.bullet}>• The winner is determined by the event's outcome</ThemedText>
                        <ThemedText style={styles.bullet}>• Creates a fun, competitive atmosphere among participants</ThemedText>
                        
                        <ThemedText style={styles.subtitle}>📎 Creating Your Perfect Event</ThemedText>
                        <ThemedText style={styles.description}>
                            Ready to create an event? Here's what you'll need to set up:
                        </ThemedText>
                        <ThemedText style={styles.bullet}>• <ThemedText style={styles.bold}>Name:</ThemedText> Something catchy that describes your event</ThemedText>
                        <ThemedText style={styles.bullet}>• <ThemedText style={styles.bold}>Description:</ThemedText> Tell people what your event is all about</ThemedText>
                        <ThemedText style={styles.bullet}>• <ThemedText style={styles.bold}>Type:</ThemedText> Choose from DONATION, FUNDRAISING, or JACKPOT type</ThemedText>
                        <ThemedText style={styles.bullet}>• <ThemedText style={styles.bold}>Recipient:</ThemedText> Who will receive the funds (required for only DONATION and FUNDRAISING types)</ThemedText>
                        <ThemedText style={styles.bullet}>• <ThemedText style={styles.bold}>Image:</ThemedText> A picture that will be used as a clicker!</ThemedText>
                        <ThemedText style={styles.bullet}>• <ThemedText style={styles.bold}>End Conditions:</ThemedText> What needs to happen for your event to complete</ThemedText>
                        
                        
                        <ThemedText style={styles.subtitle}>📎 Setting Event End Conditions</ThemedText>
                        <ThemedText style={styles.description}>
                            End conditions are what make your event dynamic. They determine when your event finishes and funds 
                            are distributed. Think of them as finish lines or goals for your event.
                            To finish and play the event, it is enough that at least one of the groups of conditions is met. 
                            The number of condition groups is not limited.
                            Each group of conditions can consist of a maximum of three conditions: 
                            the bank amount condition, the number of participants condition, and the end time and date.
                        </ThemedText>
                        
                        <ThemedText style={styles.sectionTitle}>💡 Money Goals (Bank Conditions)</ThemedText>
                        <ThemedText style={styles.description}>
                            Want your event to end when you've raised a certain amount? Use a bank condition.
                        </ThemedText>

                        <ThemedText style={styles.description}>
                            For example: "Complete the event when we've collected $5,000 or more."
                        </ThemedText>

                        <ThemedText style={styles.sectionTitle}>💡 People Goals (Participants Conditions)</ThemedText>
                        <ThemedText style={styles.description}>
                            Here we are talking about the number of participants.
                        </ThemedText>

                        <ThemedText style={styles.description}>
                            For example: "Complete the event when at least 10 people have joined in."
                        </ThemedText>
                        
                        <ThemedText style={styles.sectionTitle}>💡 Time Limits (Time Conditions)</ThemedText>
                        <ThemedText style={styles.description}>
                            Need your event to end by a specific date? Use a time condition.
                            But you shouldn't choose too big an end date, otherwise users may lose their interest
                        </ThemedText>

                        <ThemedText style={styles.description}>
                            For example: "End the event when we reach this specific date and time." 
                        </ThemedText>
                        
                        <ThemedText style={styles.sectionTitle}>💡 Combining Conditions</ThemedText>
                        <ThemedText style={styles.description}>
                            You can get creative by combining conditions. Here's how they work together:
                        </ThemedText>
                        <ThemedText style={styles.bullet}>• Conditions in the same group must ALL be met (using AND logic)</ThemedText>
                        <ThemedText style={styles.bullet}>• Different groups work as alternatives (using OR logic)</ThemedText>
                        
                        <ThemedText style={styles.description}>
                            For example: "End the event when EITHER (we've raised at least $10,000 AND have at least 5 participants) 
                            OR (we've reached our deadline date)."
                        </ThemedText>
                        
                        <ThemedText style={styles.subtitle}>📎 Finding and Filtering Events</ThemedText>
                        <ThemedText style={styles.description}>
                            When browsing events, you can narrow down your search with these filters:
                        </ThemedText>
                        <ThemedText style={styles.bullet}>• Search by event name</ThemedText>
                        <ThemedText style={styles.bullet}>• Filter by event type (DONATION, FUNDRAISING, JACKPOT)</ThemedText>
                        <ThemedText style={styles.bullet}>• Filter by progress (how close or far an event is to completion)</ThemedText>
                        <ThemedText style={styles.bullet}>• Sort events by name, creation date, or progress</ThemedText>
                        
                        <ThemedText style={styles.subtitle}>📎 Participating in Events</ThemedText>
                        <ThemedText style={styles.description}>
                            Want to join an event? Here's what you need to know:
                        </ThemedText>
                        <ThemedText style={styles.bullet}>• The event must be active (not completed yet)</ThemedText>
                        <ThemedText style={styles.bullet}>• You need enough funds in your account</ThemedText>
                        
                        <ThemedText style={styles.description}>
                            Once you contribute, you can track the event's progress toward completion. 
                            The progress indicator shows how close the event is to meeting its conditions.
                        </ThemedText>
                        
                        <ThemedText style={styles.subtitle}>📎 What Happens When an Event Completes?</ThemedText>
                        <ThemedText style={styles.description}>
                            When an event reaches its conditions, a few things happen:
                        </ThemedText>
                        <ThemedText style={styles.bullet}>• The event status changes from "active" to "completed"</ThemedText>
                        <ThemedText style={styles.bullet}>• No more contributions can be made</ThemedText>
                        <ThemedText style={styles.bullet}>• Funds are distributed according to the event type</ThemedText>
                        
                        <ThemedText style={styles.description}>
                            For DONATION and FUNDRAISING events, all funds go to the pre-specified recipient. 
                            For JACKPOT events, the system determines a winner based on random and users share of the pot's total bank.
                        </ThemedText>
                        
                        <ThemedText style={styles.subtitle}>📎 Behind the Scenes</ThemedText>
                        <ThemedText style={styles.description}>
                            Our system automatically checks if events have met their conditions:
                        </ThemedText>
                        <ThemedText style={styles.bullet}>• When someone contributes to an event</ThemedText>
                        <ThemedText style={styles.bullet}>• When an existing contribution is updated</ThemedText>
                        <ThemedText style={styles.bullet}>• Regularly for time-based conditions</ThemedText>
                        
                        <ThemedText style={styles.description}>
                            This ensures that your event moves forward and completes precisely when its conditions are met, 
                            without any manual intervention needed.
                        </ThemedText>
                        
                        <ThemedText style={styles.subtitle}>📎 Pro Tips & Strategies</ThemedText>
                        
                        <View style={styles.tipBox}>
                            <ThemedText style={styles.tipTitle}>🌟 Make Your Event Stand Out</ThemedText>
                            <ThemedText style={styles.tipText}>
                                Use a clear, eye-catching image and write a compelling description that tells a story.
                                Events with personal stories get up to 3x more participants than generic ones!
                            </ThemedText>
                        </View>
                        
                        <View style={styles.tipBox}>
                            <ThemedText style={styles.tipTitle}>⏱️ Time Your Events Strategically</ThemedText>
                            <ThemedText style={styles.tipText}>
                                Short-term events (1-7 days) tend to create urgency and get more engagement. If your event runs 
                                too long, participants may lose interest before conditions are met.
                            </ThemedText>
                        </View>
                        
                        <View style={styles.tipBox}>
                            <ThemedText style={styles.tipTitle}>💰 Set Realistic Funding Goals</ThemedText>
                            <ThemedText style={styles.tipText}>
                                Start with smaller targets for your first few events to build a track record of successful completions.
                                Our data shows events with goals under $1,000 complete 72% of the time, while those over $10,000 complete only 23% of the time.
                            </ThemedText>
                        </View>
                        
                        <View style={styles.tipBox}>
                            <ThemedText style={styles.tipTitle}>🎮 Jackpot Strategy</ThemedText>
                            <ThemedText style={styles.tipText}>
                                For Jackpot events, remember that your chances of winning increase with your contribution size relative to the total pot.
                                Making multiple smaller contributions over time can help maintain event visibility in the community feed.
                            </ThemedText>
                        </View>
                        
                        <View style={styles.tipBox}>
                            <ThemedText style={styles.tipTitle}>🔄 Combining Conditions Effectively</ThemedText>
                            <ThemedText style={styles.tipText}>
                                When creating events, consider combining a realistic time condition with ambitious funding/participation goals.
                                This ensures your event will eventually complete while still giving it a chance to exceed expectations.
                            </ThemedText>
                        </View>
                        
                        <ThemedText style={styles.subtitle}>📎 Ready to Get Started?</ThemedText>
                        <ThemedText style={styles.description}>
                            Now that you understand how events work, it's time to create your own! Whether you're 
                            raising funds for a cause, helping out a friend, or organizing a fun competition, our 
                            platform gives you the tools to make it happen.
                        </ThemedText>

                        <ThemedText style={styles.subtitle}>📎 How to top up your balance?</ThemedText>
                        <ThemedText style={styles.description}>
                            To top up your balance, you need to go to the settings page and open the Balance section.
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
            </ScrollView>
        </SafeAreaView>
    );
} 