package com.dailybalance.tracker;

import org.junit.Test;
import static org.junit.Assert.*;

public class TransactionFilterTest {

    @Test
    public void testAlertAllowed_RsAmountDebited() {
        // SMS package: title is sender/contact, body has transaction
        assertTrue(TransactionNotificationListener.isTransactionNotification(
                "BankAlert", "Rs.500 debited for CoffeeShop", true));
    }

    @Test
    public void testAlertAllowed_InrAmountCredited() {
        assertTrue(TransactionNotificationListener.isTransactionNotification(
                "BankAlert", "INR 5,000.00 credited to your A/c", true));
    }

    @Test
    public void testAlertAllowed_RupeeSymbolPaid() {
        assertTrue(TransactionNotificationListener.isTransactionNotification(
                "Friend", "Paid ₹200 to Alex via UPI", true));
    }

    @Test
    public void testAlertIgnored_SentPhotos() {
        assertFalse(TransactionNotificationListener.isTransactionNotification(
                "Friend", "I sent you 2 photos", true));
    }

    @Test
    public void testAlertIgnored_ReceivedPackage() {
        assertFalse(TransactionNotificationListener.isTransactionNotification(
                "Delivery", "Received your package, delivery at 3pm", true));
    }

    @Test
    public void testAlertIgnored_OtpMessage() {
        assertFalse(TransactionNotificationListener.isTransactionNotification(
                "SecureBank", "Your OTP is 123456, do not share", true));
    }

    @Test
    public void testAlertIgnored_BillDue() {
        assertFalse(TransactionNotificationListener.isTransactionNotification(
                "UtilityProvider", "Bill due on 15th, amount Rs.800", true));
    }

    @Test
    public void testAlertIgnored_CasualChat() {
        assertFalse(TransactionNotificationListener.isTransactionNotification(
                "Friend", "hey are you coming for dinner?", true));
    }

    @Test
    public void testAlertAllowed_PaytmNonSmsTitleAndBody() {
        // Non-SMS package (e.g. UPI app): title contains amount/keyword, body has account info
        assertTrue(TransactionNotificationListener.isTransactionNotification(
                "Received ₹10000 from Alex", "Deposited in your Bank Account - 9999 on 05 October", false));
    }

    @Test
    public void testAlertAllowed_SmsPackageRaviBody() {
        assertTrue(TransactionNotificationListener.isTransactionNotification(
                "Alex", "Paid ₹200 to Alex via UPI", true));
    }

    @Test
    public void testAlertIgnored_MeetMeHours() {
        assertFalse(TransactionNotificationListener.isTransactionNotification(
                "Alex", "Meet me in 3 hours 5 mins", true));
    }

    @Test
    public void testAlertIgnored_ContactNameWithKeywordInSms() {
        // Title contains keyword "Sent", but body does not contain currency or tx keywords
        assertFalse(TransactionNotificationListener.isTransactionNotification(
                "Sent Items Team", "see you soon", true));
    }

    @Test
    public void testDueToAllowed_WhenTransaction() {
        // "due to" should not be blocked by the "due" exclusion
        assertTrue(TransactionNotificationListener.isTransactionNotification(
                "BankAlert", "Rs.1500 debited due to online order", true, true));
    }

    @Test
    public void testSenderId_AlphanumericAllowedInRelease() {
        // VM-BANKX sender in release mode: alert
        assertTrue(TransactionNotificationListener.isTransactionNotification(
                "VM-BANKX", "Rs.500 debited for CoffeeShop", true, false));
    }

    @Test
    public void testSenderId_ContactNameRejectedInRelease() {
        // Contact "Alex" in release mode: no alert
        assertFalse(TransactionNotificationListener.isTransactionNotification(
                "Alex", "Rs.500 debited for CoffeeShop", true, false));
    }

    @Test
    public void testSenderId_ContactNameAllowedInDebug() {
        // Contact "Alex" in debug mode: alert allowed for friend testing
        assertTrue(TransactionNotificationListener.isTransactionNotification(
                "Alex", "Rs.500 debited for CoffeeShop", true, true));
    }

    @Test
    public void testExclusion_RechargeTextRejectedInAllModes() {
        // Recharge SMS: rejected in both debug and release
        assertFalse(TransactionNotificationListener.isTransactionNotification(
                "VM-AIRTEL", "recharge of Rs. 399 successfully credited to your Airtel number", true, false));
        assertFalse(TransactionNotificationListener.isTransactionNotification(
                "VM-AIRTEL", "recharge of Rs. 399 successfully credited to your Airtel number", true, true));
    }

    @Test
    public void testExclusion_ValidityAndTalktimeRejected() {
        assertFalse(TransactionNotificationListener.isTransactionNotification(
                "VM-TELCO", "Rs.199 paid for talktime with 28 days validity", true, true));
    }

    @Test
    public void testAlertSummary_ParsedAmountAndType() {
        assertEquals("₹399 credited. Tap to review",
                TransactionNotificationListener.buildAlertSummary("Rs. 399 credited to your account"));
        assertEquals("₹500 debited. Tap to review",
                TransactionNotificationListener.buildAlertSummary("Rs.500 debited for CoffeeShop"));
        assertEquals("₹200 paid. Tap to review",
                TransactionNotificationListener.buildAlertSummary("Paid ₹200 to Alex via UPI"));
    }
}
